package com.bera.inclusive_chat_app.data.audio

import java.io.File

interface AudioPlayer {
    fun playFile(file: File)
    fun stop()
}