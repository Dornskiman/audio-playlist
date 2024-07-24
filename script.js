document.addEventListener("DOMContentLoaded", function() {
    // Initialize theme based on local storage
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = 'Switch to Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = 'Switch to Dark Mode';
    }

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = 'Switch to Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = 'Switch to Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    });

    // Rest of your script here...
});

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
    const descriptionInput = document.getElementById('descriptionInput');
    const saveDescriptionButton = document.getElementById('saveDescription');

    let audioFiles = [];
    let removedTracks = [];
    let currentTrackIndex = null;

    function updatePlaylist() {
        playlist.innerHTML = '';
        audioFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;

            const description = document.createElement('span');
            description.textContent = file.description || 'No description';
            li.appendChild(description);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                removeTrack(index);
            });

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

    function updateRemovedTracks() {
        removedTracksList.innerHTML = '';
        removedTracks.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;

            const reAddButton = document.createElement('button');
            reAddButton.textContent = 'Re-add';
            reAddButton.addEventListener('click', (e) => {
                e.stopPropagation();
                reAddTrack(index);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Permanently Delete';
            deleteButton.classList.add('delete');
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                permanentlyDeleteTrack(index);
            });

            li.appendChild(reAddButton);
            li.appendChild(deleteButton);
            removedTracksList.appendChild(li);
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
                    updatePlaylist();
                    descriptionInput.value = file.description || '';
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
            playTrack(0);
        }
    }

    function playPreviousTrack() {
        if (currentTrackIndex > 0) {
            playTrack(currentTrackIndex - 1);
        } else if (loopPlaylistCheckbox.checked) {
            playTrack(audioFiles.length - 1);
        }
    }

    function saveDescription() {
        if (currentTrackIndex !== null) {
            const file = audioFiles[currentTrackIndex];
            file.description = descriptionInput.value;
            updatePlaylist();
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
            currentSound.currentTime = 0;
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
        console.log('Loop Playlist set to:', loopPlaylistCheckbox.checked);
    });

    loopSongCheckbox.addEventListener('change', function() {
        currentSound.loop = loopSongCheckbox.checked;
        console.log('Loop Song set to:', loopSongCheckbox.checked);
    });

    speedInput.addEventListener('change', function() {
        currentSound.playbackRate = parseFloat(speedInput.value);
        console.log('Playback speed set to:', speedInput.value);
    });

    currentSound.addEventListener('ended', function() {
        if (loopPlaylistCheckbox.checked) {
            playNextTrack();
        } else {
            playNextTrack();
        }
    });

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });

    saveDescriptionButton.addEventListener('click', saveDescription);
});
