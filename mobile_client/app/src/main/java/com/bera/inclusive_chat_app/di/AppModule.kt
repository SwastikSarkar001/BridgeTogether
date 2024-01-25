package com.bera.inclusive_chat_app.di

import com.bera.inclusive_chat_app.data.audio.AudioPlayer
import com.bera.inclusive_chat_app.data.audio.AudioPlayerImpl
import com.bera.inclusive_chat_app.data.audio.AudioRecorder
import com.bera.inclusive_chat_app.data.audio.AudioRecorderImpl
import com.bera.inclusive_chat_app.presentation.chat.ChatViewModel
import com.bera.inclusive_chat_app.presentation.chat.Message
import com.bera.inclusive_chat_app.presentation.chat.UserType
import com.bera.inclusive_chat_app.presentation.sign_in.SignInViewModel
import com.bera.inclusive_chat_app.utils.Constants
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.storage.ktx.storage
import org.koin.android.ext.koin.androidApplication
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.core.qualifier.named
import org.koin.dsl.module
import java.io.File

val appModule = module {
    single { Firebase.auth }
    single { Firebase.firestore }
    single { Firebase.storage(Constants.firebaseStoragePath) }
    single<AudioRecorder> { AudioRecorderImpl(androidApplication()) }
    single<File>(named("cacheDir")) { androidApplication().cacheDir }
    single<AudioPlayer> { AudioPlayerImpl(androidApplication()) }
    viewModel { (navArgs: UserType) ->
        ChatViewModel(
            get(),
            get(),
            get(),
            get(),
            get(named("cacheDir")),
            get(),
            navArgs
        )
    }
    viewModel { SignInViewModel() }
}