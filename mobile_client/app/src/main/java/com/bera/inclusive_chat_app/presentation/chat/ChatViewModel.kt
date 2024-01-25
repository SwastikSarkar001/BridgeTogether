package com.bera.inclusive_chat_app.presentation.chat

import android.net.Uri
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.assemblyai.api.AssemblyAI
import com.bera.inclusive_chat_app.data.audio.AudioPlayer
import com.bera.inclusive_chat_app.data.audio.AudioRecorder
import com.bera.inclusive_chat_app.domain.models.Person
import com.bera.inclusive_chat_app.utils.Constants
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.snapshots
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageReference
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import java.io.File
import java.util.UUID

class ChatViewModel(
    private val db: FirebaseFirestore,
    private val auth: FirebaseAuth,
    private val audioRecorder: AudioRecorder,
    private val audioPlayer: AudioPlayer,
    private val cacheDir: File?,
    private val fbStorage: FirebaseStorage,
    private val navArgs: UserType
) : ViewModel() {

    var user: FirebaseUser = auth.currentUser!!
    var messages by mutableStateOf(listOf<Message>())
    private var users by mutableStateOf(listOf<Person>())
    private var recordedFile by mutableStateOf<File?>(null)
    private val storageRef = fbStorage.reference
    var recordState by mutableStateOf(false)
        private set
    var playerState by mutableStateOf(false)
        private set
    val userType = navArgs
    var selectedImageUris by mutableStateOf<List<Uri>>(emptyList())
    private var sttClient: AssemblyAI = AssemblyAI.builder()
        .apiKey(Constants.assemblyAiKey)
        .build()

    init {
        db.collection("messages")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(25)
            .snapshots()
            .flowOn(Dispatchers.IO)
            .onEach { value ->
                val msgResult = value.documents
                when (userType) {
                    UserType.DEAF ->
                        messages = msgResult.mapNotNull { doc ->
                            Message(
                                text = doc.getString("text") ?: "",
                                id = doc.id,
                                uid = doc.getString("uid") ?: "",
                                createdAt = doc.getTimestamp("createdAt")
                                    ?: Timestamp.now(),
                                photoUrl = doc.getString("photoUrl") ?: "",
                                auth = auth,
                                audioUrl = "",
                                audioPath = ""
                            )

                        }

                    UserType.COLOR_BLIND -> {
                        messages = msgResult.mapNotNull { doc ->
                            Message(
                                text = doc.getString("text") ?: "",
                                id = doc.id,
                                uid = doc.getString("uid") ?: "",
                                createdAt = doc.getTimestamp("createdAt")
                                    ?: Timestamp.now(),
                                photoUrl = doc.getString("photoUrl") ?: "",
                                auth = auth,
                                audioUrl = "",
                                audioPath = ""
                            )
                        }
                    }

                    UserType.BLIND -> {
                        messages = msgResult.mapNotNull { doc ->
                            Message(
                                text = doc.getString("text") ?: "",
                                id = doc.id,
                                uid = doc.getString("uid") ?: "",
                                createdAt = doc.getTimestamp("createdAt")
                                    ?: Timestamp.now(),
                                photoUrl = doc.getString("photoUrl") ?: "",
                                auth = auth,
                                audioUrl = "",
                                audioPath = ""
                            )
                        }
                    }

                    UserType.NORMAL -> {
                        messages = msgResult.mapNotNull { doc ->
                            doc?.getString("audioPath")?.let {
                                if (it.isBlank()) {
                                    Message(
                                        text = doc.getString("text") ?: "",
                                        id = doc.id,
                                        uid = doc.getString("uid") ?: "",
                                        createdAt = doc.getTimestamp("createdAt")
                                            ?: Timestamp.now(),
                                        photoUrl = doc.getString("photoUrl") ?: "",
                                        auth = auth,
                                        audioUrl = "",
                                        audioPath = ""
                                    )
                                } else {
                                    Message(
                                        text = "",
                                        id = doc.id,
                                        uid = doc.getString("uid") ?: "",
                                        createdAt = doc.getTimestamp("createdAt")
                                            ?: Timestamp.now(),
                                        photoUrl = doc.getString("photoUrl") ?: "",
                                        auth = auth,
                                        audioUrl = "",
                                        audioPath = it
                                    )
                                }
                            }
                        }
                    }
                }
            }
            .flowOn(Dispatchers.Default)
            .launchIn(viewModelScope)

        db.collection("users")
            .snapshots()
            .flowOn(Dispatchers.IO)
            .onEach { value ->
                val usersResult = value.documents
                users = usersResult.mapNotNull {
                    Person(
                        uid = it.getString("uid") ?: "",
                        name = it.getString("name") ?: "",
                        email = it.getString("name") ?: "",
                        photoUrl = it.getString("photoUrl") ?: ""
                    )
                }
            }
            .flowOn(Dispatchers.Default)
            .launchIn(viewModelScope)

    }

    fun sendMessage(text: String) {
        val message = hashMapOf(
            "text" to text,
            "createdAt" to Timestamp.now(),
            "photoUrl" to "",
            "uid" to user.uid,
            "audioUrl" to "",
            "audioPath" to ""
        )
        viewModelScope.launch(Dispatchers.IO) {
            db.collection("messages")
                .add(message)
                .await()
        }
    }

    fun onRecordAudio() {
        File(cacheDir, "${UUID.randomUUID()}.mp3").also {
            audioRecorder.start(it)
            recordedFile = it
        }
        recordState = !recordState
    }

    fun onStopRecord() {
        audioRecorder.stop()
        recordedFile?.also {
            sendFile(it, FileType.Audio)
        }
        recordState = !recordState
    }

    fun onPlayAudio(pathString: String) {
        val fileRef = storageRef.child(pathString)
        viewModelScope.launch(Dispatchers.Main) {
            val file = File(cacheDir, pathString).let {
                if (it.exists())
                    it
                else downloadFile(
                    pathString,
                    fileRef
                )
            }
            audioPlayer.playFile(file)
            playerState = !playerState
        }
    }

    fun onStopPlay() {
        audioPlayer.stop()
        playerState = !playerState
    }

    suspend fun downloadFile(pathString: String, fileRef: StorageReference): File =
        withContext(Dispatchers.IO) {
            val localFile = File(cacheDir, pathString)
            localFile.parentFile?.mkdirs()
            fileRef.getFile(localFile)
                .await()
            return@withContext localFile
        }

    fun sendFile(fileToSend: File, type: FileType) {
        var downloadUri: Uri? = null
        val file = Uri.fromFile(fileToSend)
        val pathString = "${
            when (type) {
                FileType.Audio -> "audio"
                FileType.Image -> "images"
            }
        }/${file.lastPathSegment}"
        val fileRef = storageRef.child(pathString)
        viewModelScope.launch(Dispatchers.IO) {
            fileRef.putFile(file).await()
            downloadUri = fileRef.downloadUrl.await()

            val message = when (type) {
                FileType.Audio -> {
                    try {
                        Log.d("transcribe", "transcribe start")
                        val transcript = sttClient.transcripts()
                            .transcribe(downloadUri.toString())
                        hashMapOf(
                            "text" to (transcript?.text?.get() ?: ""),
                            "createdAt" to Timestamp.now(),
                            "photoUrl" to "",
                            "uid" to user.uid,
                            "audioUrl" to (downloadUri?.toString() ?: ""),
                            "audioPath" to pathString

                        )
                    } catch (e: Exception) {
                        Log.d("transcribe", e.message!!)
                        hashMapOf(
                            "text" to "",
                            "createdAt" to Timestamp.now(),
                            "photoUrl" to "",
                            "uid" to user.uid,
                            "audioUrl" to (downloadUri?.toString() ?: ""),
                            "audioPath" to pathString

                        )
                    }
                }

                FileType.Image -> hashMapOf(
                    "text" to "",
                    "createdAt" to Timestamp.now(),
                    "photoUrl" to downloadUri.toString(),
                    "uid" to user.uid,
                    "audioUrl" to "",
                    "audioPath" to ""
                )
            }
            db.collection("messages")
                .add(message)
                .await()
        }
    }

    fun findUser(uid: String): Person? = users.find { it.uid != user.uid && it.uid == uid }
}