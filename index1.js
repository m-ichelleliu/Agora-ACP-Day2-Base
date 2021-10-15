// Create Agora Client
var client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});

var localTracks = {
    videoTrack: null,
    audioTrack: null
};

var localTrackState={
    videoTrackEnabled: true,
    audioTrackEnabled: true
}

var remoteUsers = {};

var options = {
    appID: "c009eb4d56614e4090b28c52830a6880",
    channel: null,
    uid: null,
    token: null
};

// Join Form
$("#join-form").submit(async function (e) {
    e.preventDefault();
    console.log("Form Submit");
    options.appID = "c009eb4d56614e4090b28c52830a6880";
    options.channel = $("#channel").val();
    await join();
});

async function join() {
    client.on("user-published", handleUserPublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    $("#leave").attr("disabled", false);
    $("#join").attr("disabled", true);
    $("#mic-btn").attr("disabled", false);
    $("#vid-btn").attr("disabled", false);
    options.uid = await client.join(options.appID, options.channel, null, null);
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    localTracks.videoTrack.play("local-player");
    await client.publish(Object.values(localTracks));
}

function handleUserJoined(user) {
    console.log("------------------------");
    console.log("User Joined");
    const id = user.uid;
    remoteUsers[id] = user;
}

function handleUserPublished(user, mediaType) {
    subscribeOthers(user, "video");
}

async function subscribeOthers(user, mediaType) {
    const id = user.uid;
    await client.subscribe(user, mediaType);
    console.log("--------------------");
    console.log("playing");
    if (mediaType == "video") {
        const remotePlayer=$(`
            <div id="player-wrapper-${id}"
            <p class="player-name">remoteUser${id}</p>
            <div id="player-${id}" class="player"></div>
            </div>
        `)
        $("#remote-playerlist").append(remotePlayer);
        user.videoTrack.play(`player-${id}`);
    }
}

function handleUserLeft(user, mediaType) {
    unsubscribe(user, mediaType);
    const id=user.id;
    delete remoteUsers[id];
    $(`#player-wrapper-$id}`).remove();
}

async function leave() {
    for (trackName in localTracks) {
        var track=localTracks[trackName];
        if (track) {
            track.stop();
            track.close();
            localTracks[trackName]=undefined;
        }
    }
    $("#remote-playerlist").html("");
    $("#mic-btn").attr("disabled", true);
    $("#vid-btn").attr("disabled", true);
    $("#leave").attr("disabled", true);
    $("#join").attr("disabled", false);
    await client.leave();
}

$("#leave").click(function (){
    leave();
});

$("#mic-btn").click(function (){
    if(localTrackState.audioTrackEnabled) {
        muteAudio();
    } else {
        unmuteAudio();
    }
});

$("#vid-btn").click(function (){
    if(localTrackState.videoTrackEnabled) {
        muteVideo();
    } else {
        unmuteVideo();
    }
});

async function muteAudio() {
    console.log("Muting");
    if (!localTracks.audioTrack) {return;}
    await localTracks.audioTrack.setEnabled(false);
    localTrackState.audioTrackEnabled = false;
    $("mic-btn").text("Unmute Audio");
}

async function unMuteAudio() {
    console.log("Unmuting");
    if (localTracks.audioTrack) {return;}
    await localTracks.audioTrack.setEnabled(true);
    localTrackState.audioTrackEnabled = true;
    $("mic-btn").text("Mute Audio");
}

async function muteVideo() {
    console.log("Muting");
    if (!localTracks.videoTrack) {return;}
    await localTracks.videoTrack.setEnabled(false);
    localTrackState.videoTrackEnabled = false;
    $("vid-btn").text("Unmute Video");
}

async function unMuteVideo() {
    console.log("Unmuting");
    if (localTracks.videoTrack) {return;}
    await localTracks.videoTrack.setEnabled(true);
    localTrackState.videoTrackEnabled = true;
    $("vid-btn").text("Mute Video");
}