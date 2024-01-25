package com.bera.inclusive_chat_app

import android.Manifest
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgs
import androidx.navigation.navArgument
import com.bera.inclusive_chat_app.presentation.chat.ChatScreen
import com.bera.inclusive_chat_app.presentation.chat.ChatViewModel
import com.bera.inclusive_chat_app.presentation.chat.UserType
import com.bera.inclusive_chat_app.presentation.profile.ProfileScreen
import com.bera.inclusive_chat_app.presentation.sign_in.GoogleAuthUiClient
import com.bera.inclusive_chat_app.presentation.sign_in.SignInScreen
import com.bera.inclusive_chat_app.presentation.sign_in.SignInViewModel
import com.bera.inclusive_chat_app.ui.theme.InclusivechatappTheme
import com.google.android.gms.auth.api.identity.Identity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import org.koin.android.ext.android.inject
import org.koin.androidx.compose.koinViewModel
import org.koin.androidx.compose.navigation.koinNavViewModel
import org.koin.core.parameter.parametersOf

class MainActivity : ComponentActivity() {

    private val auth: FirebaseAuth by inject()
    private val db: FirebaseFirestore by inject()

    private val googleAuthUiClient by lazy {
        GoogleAuthUiClient(
            context = applicationContext,
            oneTapClient = Identity.getSignInClient(applicationContext),
            auth = auth
        )
    }

    private val startDestination by lazy {
        if (googleAuthUiClient.getSignedInUser() != null) {
            "profile"
        } else {
            "sign_in"
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ActivityCompat
            .requestPermissions(
                this,
                arrayOf(Manifest.permission.RECORD_AUDIO),
                0
            )
        setContent {
            InclusivechatappTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = startDestination) {
                        composable("sign_in") {
                            val viewModel: SignInViewModel by viewModels<SignInViewModel>()
                            val state by viewModel.state.collectAsState()

                            val launcher = rememberLauncherForActivityResult(
                                contract = ActivityResultContracts.StartIntentSenderForResult(),
                                onResult = { result ->
                                    if (result.resultCode == RESULT_OK) {
                                        lifecycleScope.launch {
                                            val signInResult = googleAuthUiClient.signInWithIntent(
                                                intent = result.data ?: return@launch
                                            )
                                            viewModel.onSignInResult(signInResult)
                                        }
                                    }
                                }
                            )

                            LaunchedEffect(key1 = state.isSignInSuccessful) {
                                if (state.isSignInSuccessful) {
                                    Toast.makeText(
                                        applicationContext,
                                        "Sign in successful",
                                        Toast.LENGTH_LONG
                                    ).show()
                                    val fbUser = auth.currentUser!!
                                    val user = hashMapOf(
                                        "uid" to fbUser.uid,
                                        "name" to fbUser.displayName,
                                        "email" to fbUser.email,
                                        "photoUrl" to fbUser.photoUrl
                                    )
                                    db.collection("users")
                                        .document(fbUser.uid)
                                        .set(user)
                                        .await()
                                    viewModel.resetState()
                                    navController.navigate("profile") {
                                        popUpTo(navController.graph.startDestinationId) {
                                            inclusive = true
                                        }
                                    }
                                }
                            }

                            SignInScreen(
                                state = state,
                                onSignInClick = {
                                    lifecycleScope.launch {
                                        val signInIntentSender = googleAuthUiClient.signIn()
                                        launcher.launch(
                                            IntentSenderRequest.Builder(
                                                signInIntentSender ?: return@launch
                                            ).build()
                                        )
                                    }
                                }
                            )
                        }
                        composable("profile") {
                            ProfileScreen(
                                userData = googleAuthUiClient.getSignedInUser(),
                                onSignOut = {
                                    lifecycleScope.launch {
                                        googleAuthUiClient.signOut()
                                        Toast.makeText(
                                            applicationContext,
                                            "Signed out",
                                            Toast.LENGTH_LONG
                                        ).show()
                                        navController.navigate("sign_in") {
                                            popUpTo(navController.graph.startDestinationId) {
                                                inclusive = true
                                            }
                                        }
                                    }
                                },
                                navigate = { dest ->
                                    navController.navigate(dest)
                                }
                            )
                        }
                        composable("chat/{userType}", listOf(navArgument("userType") {
                            type = NavType.StringType
                        })) {
                            val viewModel: ChatViewModel =
                                koinNavViewModel<ChatViewModel> {
                                    parametersOf(
                                        UserType.valueOf(
                                            it.arguments?.getString(
                                                "userType"
                                            )!!
                                        )
                                    )
                                }
                            ChatScreen(
                                viewModel = viewModel,
                                navigateBackToProfile = navController::popBackStack
                            )
                        }
                    }
                }
            }
        }
    }
}