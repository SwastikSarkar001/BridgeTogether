package com.bera.inclusive_chat_app.presentation.chat

import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase

data class MessageDto(
    val text: String,
    val timeStamp: String,
    val photoUrl: String,
    val uid: String
)

