package com.conversight;

import android.content.Intent;
import android.os.Bundle;
// import android.os.Handler;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    // private static final int SPLASH_DELAY = 2000;

    // private final Handler mHandler = new Handler();
    // private final Launcher mLauncher = new Launcher();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }

    // @Override
    // protected void onStart() {
    // super.onStart();

    // mHandler.postDelayed(mLauncher, SPLASH_DELAY);
    // }

    // @Override
    // protected void onStop() {
    // mHandler.removeCallbacks(mLauncher);
    // super.onStop();
    // }

    // private void launch() {
    // if (!isFinishing()) {
    // Intent intent = new Intent(this, MainActivity.class);
    // startActivity(intent);
    // overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
    // finish();
    // }
    // }

    // private class Launcher implements Runnable {
    // @Override
    // public void run() {
    // launch();
    // }
    // }
}