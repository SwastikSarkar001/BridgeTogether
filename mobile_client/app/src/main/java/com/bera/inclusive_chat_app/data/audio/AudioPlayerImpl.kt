package com.bera.inclusive_chat_app.data.audio

import android.content.Context
import android.media.MediaPlayer
import androidx.core.net.toUri
import java.io.File

class AudioPlayerImpl(
    private val context: Context
): AudioPlayer {
    private var audioPlayer: MediaPlayer? =null

    override fun playFile(file: File) {
        MediaPlayer.create(context, file.toUri()).apply {
            audioPlayer = this
            start()
        }
    }

    override fun stop() {
        audioPlayer?.stop()
        audioPlayer?.release()
        audioPlayer = null
    }
}