package com.bera.inclusive_chat_app.presentation.chat

import android.text.format.DateUtils
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import org.koin.androidx.compose.get
import java.io.File
import java.util.Date
import java.util.Locale

data class Message(
    val text: String,
    val id: String,
    val uid: String,
    val audioUrl: String,
    val audioPath: String,
    val createdAt: Timestamp,
    val photoUrl: String,
    val auth: FirebaseAuth
) {
    val formattedTime = formatTimestampForChat(createdAt)
    val isFromMe: Boolean = auth.currentUser!!.uid == uid
    private fun formatTimestampForChat(timestamp: Timestamp): String {
        val currentTimeMillis = System.currentTimeMillis()
        val messageTimeMillis = timestamp.toDate().time

        val diffMillis = currentTimeMillis - messageTimeMillis

        return when {
            diffMillis < DateUtils.MINUTE_IN_MILLIS -> "Just now"
            diffMillis < DateUtils.HOUR_IN_MILLIS -> {
                val minutes = (diffMillis / DateUtils.MINUTE_IN_MILLIS).toInt()
                "$minutes min ago"
            }
            diffMillis < DateUtils.DAY_IN_MILLIS -> {
                val hours = (diffMillis / DateUtils.HOUR_IN_MILLIS).toInt()
                "$hours hours ago"
            }
            else -> {
                // Format for older messages using SimpleDateFormat
                val sdf = java.text.SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
                sdf.format(Date(messageTimeMillis))
            }
        }
    }
}
