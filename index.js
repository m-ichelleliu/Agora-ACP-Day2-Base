const client = AgoraRTC.createClient({
    codec: "vp8",
    mode: "rtc",
});

var personCount = 0;

$("#hi").submit(async function (e) {
    e.preventDefault();
    console.log("b");
    const uid = await client.join("fd08b9bee9554c789692cd2477b977ea", $("#room").val(), null);
    console.log("Joined");
    
    // Create audio and video tracks
    const cameraTrack = await AgoraRTC.createCameraVideoTrack();
    const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
    
    // Publish and play
    await client.publish(cameraTrack);
    await client.publish(microphoneTrack);
    cameraTrack.play("local-player");
});

client.on("user-published", async (user, mediaType) => {
    // Initiate the subscription
    await client.subscribe(user, mediaType);
    personCount += 1;
  
    // If the subscribed track is an audio track
    if (mediaType === "audio") {
      const audioTrack = user.audioTrack;
      // Play the audio
      audioTrack.play();
    } else {
      const videoTrack = user.videoTrack;
      // Play the video
      videoTrack.play("remote-players");
        const remotePlayer=$(`
            <div id="player-${personCount}" class="player"></div>
        `)
        $("#remote-player").append(remotePlayer);
        user.videoTrack.play(`player-${personCount}`);
    }
    }
});

client.on("user-left", async => {
    await client.unsubscribe(user, "video");
    await client.unsubscribe(user, "audio");
});



/*
await client.leave();
await client.unpublish();

// Subscribe to a specific user's audio and video
await client.subscribe(user, "audio");
await client.subscribe(user, "video");

// Unsubscribe from a specific user's video
await client.unsubscribe(user, "video");
// Or unsubscribe from all the media tracks of a specific user
await client.unsubscribe(user);
*/