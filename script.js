document.addEventListener("DOMContentLoaded", function() {
    const uploadSound = document.getElementById('uploadSound');
    const playButton = document.getElementById('playButton');
    const stopButton = document.getElementById('stopButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const loopPlaylistCheckbox = document.getElementById('loopPlaylistCheckbox');
    const loopSongCheckbox = document.getElementById('loopSongCheckbox');
    const speedInput = document.getElementById('speedInput');
    const currentSound = document.getElementById('currentSound');
    const playlist = document.getElementById('playlist');
    const removedTracksList = document.getElementById('removedTracks');
    const themeToggle = document.getElementById('themeToggle');
    const fartSound = document.getElementById('fartSound');

    let audioFiles = [];
    let removedTracks = [];
    let currentTrackIndex = 0;

    function updatePlaylist() {
        playlist.innerHTML = ''; // Clear existing playlist

        audioFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;

            const descriptionInput = document.createElement('input');
            descriptionInput.type = 'text';
            descriptionInput.value = file.description || '';
            descriptionInput.placeholder = 'Add a description...';
            descriptionInput.addEventListener('change', (e) => {
                file.description = e.target.value;
            });

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the li click event
                removeTrack(index);
            });

            li.appendChild(descriptionInput);
            li.appendChild(removeButton);

            li.addEventListener('click', () => {
                playTrack(index);
            });

            if (index === currentTrackIndex) {
                li.classList.add('active');
            }

            playlist.appendChild(li);
        });
    }

    function playTrack(index) {
        if (index >= 0 && index < audioFiles.length) {
            const file = audioFiles[index];
            const url = URL.createObjectURL(file);
            currentSound.src = url;
            currentSound.play()
                .then(() => {
                    currentTrackIndex = index;
                    updatePlaylist(); // Update playlist to reflect the current track
                    console.log('Playing:', file.name);
                })
                .catch((error) => {
                    console.error('Error playing audio:', error);
                });
        }
    }

    function removeTrack(index) {
        if (index >= 0 && index < audioFiles.length) {
            const removedFile = audioFiles.splice(index, 1)[0];
            removedTracks.push(removedFile);
            updatePlaylist();
            updateRemovedTracks();

            if (currentTrackIndex >= audioFiles.length) {
                currentTrackIndex = audioFiles.length - 1;
            }

            if (currentSound.src && currentTrackIndex < audioFiles.length) {
                playTrack(currentTrackIndex);
            }
        }
    }

    function permanentlyDeleteTrack(index) {
        if (index >= 0 && index < removedTracks.length) {
            removedTracks.splice(index, 1);
            updateRemovedTracks();
        }
    }

    function reAddTrack(index) {
        if (index >= 0 && index < removedTracks.length) {
            const reAddedFile = removedTracks.splice(index, 1)[0];
            audioFiles.push(reAddedFile);
            updatePlaylist();
            updateRemovedTracks();
        }
    }

    function playNextTrack() {
        if (currentTrackIndex < audioFiles.length - 1) {
            playTrack(currentTrackIndex + 1);
        } else if (loopPlaylistCheckbox.checked) {
            playTrack(0); // Loop to the first track
        }
    }

    function playPreviousTrack() {
        if (currentTrackIndex > 0) {
            playTrack(currentTrackIndex - 1);
        } else if (loopPlaylistCheckbox.checked) {
            playTrack(audioFiles.length - 1); // Loop to the last track
        }
    }

    uploadSound.addEventListener('change', function(event) {
        const files = Array.from(event.target.files);
        audioFiles = [...audioFiles, ...files];
        updatePlaylist();
        console.log('Audio files uploaded:', audioFiles.map(file => file.name));
    });

    playButton.addEventListener('click', function() {
        if (currentSound.src) {
            currentSound.loop = loopSongCheckbox.checked;
            currentSound.play()
                .then(() => {
                    console.log('Audio is playing');
                })
                .catch((error) => {
                    console.error('Error playing audio:', error);
                });
        }
    });

    stopButton.addEventListener('click', function() {
        if (!currentSound.paused) {
            currentSound.pause();
            currentSound.currentTime = 0; // Reset playback to the start
            console.log('Audio stopped');
        }
    });

    nextButton.addEventListener('click', function() {
        playNextTrack();
    });

    prevButton.addEventListener('click', function() {
        playPreviousTrack();
    });

    loopPlaylistCheckbox.addEventListener('change', function() {
        console.log('Loop Playlist:', loopPlaylistCheckbox.checked);
    });

    loopSongCheckbox.addEventListener('change', function() {
        currentSound.loop = loopSongCheckbox.checked;
        console.log('Loop Song:', loopSongCheckbox.checked);
    });

    speedInput.addEventListener('change', function() {
        currentSound.playbackRate = parseFloat(speedInput.value);
        console.log('Playback speed set to:', speedInput.value);
    });

    currentSound.addEventListener('ended', function() {
        if (loopPlaylistCheckbox.checked) {
            playNextTrack(); // Play next track
        }
    });

    document.body.classList.add('dark-mode');
    themeToggle.textContent = 'Switch to Light Mode';

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });

    // Handle "F" key press for fart sound
    document.addEventListener('keydown', function(event) {
        if (event.key === 'f' || event.key === 'F') {
            if (fartSound) {
                fartSound.play();
            }
        }
    });
});
