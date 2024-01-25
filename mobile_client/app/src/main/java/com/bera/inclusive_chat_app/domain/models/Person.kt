package com.bera.inclusive_chat_app.domain.models

import com.bera.inclusive_chat_app.presentation.chat.UserType

data class Person(
    val uid: String,
    val name: String?,
    val email: String?,
    val photoUrl: String?
)
