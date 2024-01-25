package com.bera.inclusive_chat_app.presentation.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.bera.inclusive_chat_app.domain.models.Person
import com.bera.inclusive_chat_app.presentation.chat.UserType

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    userData: Person?,
    onSignOut: () -> Unit,
    navigate: (String) -> Unit
) {
    var isDropDownExpanded by remember { mutableStateOf(false) }
    var userType by rememberSaveable { mutableStateOf(UserType.NORMAL.name) }
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (userData?.photoUrl != null) {
            AsyncImage(
                model = userData.photoUrl,
                contentDescription = "Profile picture",
                modifier = Modifier
                    .size(150.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        if (userData?.name != null) {
            Text(
                text = userData.name,
                textAlign = TextAlign.Center,
                fontSize = 36.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        ExposedDropdownMenuBox(
            modifier = Modifier
                .width(120.dp)
                .height(40.dp),
            expanded = isDropDownExpanded,
            onExpandedChange = { isDropDownExpanded = !isDropDownExpanded }) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0xFF323A69))
                    .menuAnchor(),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = userType,
                    color = Color.White,
                    style = MaterialTheme.typography.labelLarge
                )
                Icon(
                    imageVector = if (isDropDownExpanded)
                        Icons.Default.ArrowDropUp
                    else
                        Icons.Default.ArrowDropDown,
                    contentDescription = "icon",
                    tint = Color.White
                )
            }
            ExposedDropdownMenu(
                modifier = Modifier.width(118.dp),
                expanded = isDropDownExpanded,
                onDismissRequest = { isDropDownExpanded = false }) {
                UserType.entries.forEach {
                    DropdownMenuItem(
                        text = { Text(text = it.name) },
                        onClick = {
                            userType = it.name
                            isDropDownExpanded = false
                        })
                }
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Button(colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF323A69)), onClick = {
            navigate("chat/${userType}")
        }) {
            Text(text = "Go to chat")
        }
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF323A69)),
            onClick = onSignOut
        ) {
            Text(text = "Sign out")
        }
    }
}