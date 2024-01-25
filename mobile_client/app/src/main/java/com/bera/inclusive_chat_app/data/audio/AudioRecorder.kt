package com.bera.inclusive_chat_app.data.audio

import java.io.File

interface AudioRecorder {
    fun start(outputFile: File)
    fun stop()
}