const client = AgoraRTC.createClient({
    codec: "vp8",
    mode: "rtc",
});

var mic_muted = false;
var vid_muted = false;
var sharing_screen = false;

var localTracks = {
    videoTrack: null,
    audioTrack: null
};

// Create Client
$("#hi").submit(async function (e) {
    client.on("user-published", publishUser);
    client.on("user-left", leaveUser);

    e.preventDefault();
    await client.join("fd08b9bee9554c789692cd2477b977ea", $("#room").val(), null);

    // Adjust button status
    $("#leave").attr("disabled", false);
    $("#join").attr("disabled", true);
    $("#mic").attr("disabled", false);
    $("#vid").attr("disabled", false);
    $("#screen").attr("disabled", false);
    
    // Create audio and video tracks
    localTracks.videoTrack = cameraTrack = await AgoraRTC.createCameraVideoTrack();
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    
    // Publish and play
    await client.publish(localTracks.videoTrack);
    await client.publish(localTracks.audioTrack);
    cameraTrack.play("local-player");
});

async function publishUser(user, mediaType) {
    console.log("subscribing");

    await client.subscribe(user, mediaType);
    console.log("Subscription occurring");
  
    if (mediaType === "audio") {
      const audioTrack = user.audioTrack;
      audioTrack.play();
    } else {
        const videoTrack = user.videoTrack;
        const uid = user.id;
        const remotePlayer=$(`
            <div class="grid-item">
                <div id="player-${uid}" class="player"></div>
            </div>
        `)
        $("#video-players").append(remotePlayer);
        videoTrack.play(`player-${uid}`);
    }
};

var screenClient;
var screenTrack;

// Screen Share
$("#screen").click(async function (e) {
    e.preventDefault();
        if (!sharing_screen) {
        screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await screenClient.join("fd08b9bee9554c789692cd2477b977ea", $("#room").val(), null);

        screenTrack = await AgoraRTC.createScreenVideoTrack({
            encoderConfig: "1080p_1",
        }, "enable")
        $("#screen").text("Stop Sharing");
        await screenClient.publish(screenTrack);
    } else {
        $("#screen").text("Share Screen");
        await screenClient.unpublish(screenTrack);
    }
    sharing_screen = !sharing_screen;
});

async function leaveUser() {
    await client.unsubscribe(user, "video");
    await client.unsubscribe(user, "audio");
    $(`#player-${uid}`).remove();
};

$("#leave").click(async function () {
    console.log("am leaving");
    $("#mic-btn").attr("disabled", true);
    $("#vid-btn").attr("disabled", true);
    $("#leave").attr("disabled", true);
    $("#join").attr("disabled", false);
    $("#screen").attr("disabled", true);
    $("#video-players").html(`<div id="local-player" class="grid-item-1" class="player"></div>`);
    await client.unpublish();
    await client.leave();
});


$("#mic").click(async function () {
    if (!mic_muted) {
        await localTracks.audioTrack.setEnabled(false);
        $("#mic").text("Unmute Audio");
    } else {
        await localTracks.audioTrack.setEnabled(true);
        $("#mic").text("Mute Audio");
    }
    mic_muted = !mic_muted;
});

$("#vid").click(async function () {
    if (!vid_muted) {
        await localTracks.videoTrack.setEnabled(false);
        $("#vid").text("Unmute Video");
    } else {
        await localTracks.videoTrack.setEnabled(true);
        $("#vid").text("Mute Video");
    }
    vid_muted = !vid_muted;
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