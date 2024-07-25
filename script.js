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
    const confirmDescriptionButton = document.getElementById('confirmDescriptionButton');

    let audioFiles = [];
    let removedTracks = [];
    let currentTrackIndex = 0;

    // Initialize theme based on local storage
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = 'Switch to Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = 'Switch to Dark Mode';
    }

    // Theme toggle
    themeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            themeToggle.textContent = 'Switch to Dark Mode';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = 'Switch to Light Mode';
            localStorage.setItem('theme', 'dark');
        }
    });

    function updatePlaylist() {
        playlist.innerHTML = ''; // Clear existing playlist

        audioFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;

            // Create a span for the description text
            const descriptionText = document.createElement('span');
            descriptionText.className = 'track-description';
            descriptionText.textContent = file.description || 'No description';

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the li click event
                removeTrack(index);
            });

            li.appendChild(descriptionText);
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
        removedTracksList.innerHTML = ''; // Clear removed tracks list

        removedTracks.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;

            const reAddButton = document.createElement('button');
            reAddButton.textContent = 'Re-add';
            reAddButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the li click event
                reAddTrack(index);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Permanently Delete';
            deleteButton.classList.add('delete');
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the li click event
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

            // Adjust currentTrackIndex if needed
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
            // Permanently delete the track
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

    // Handle file upload
    uploadSound.addEventListener('change', function(event) {
        const files = Array.from(event.target.files);
        audioFiles = [...audioFiles, ...files];
        updatePlaylist();
        console.log('Audio files uploaded:', audioFiles.map(file => file.name));
    });

    // Play the current track
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

    // Stop the sound
    stopButton.addEventListener('click', function() {
        if (!currentSound.paused) {
            currentSound.pause();
            currentSound.currentTime = 0; // Reset playback to the start
            console.log('Audio stopped');
        }
    });

    // Skip to next track
    nextButton.addEventListener('click', function() {
        playNextTrack();
    });

    // Skip to previous track
    prevButton.addEventListener('click', function() {
        playPreviousTrack();
    });

    // Update loop settings
    loopPlaylistCheckbox.addEventListener('change', function() {
        console.log('Loop playlist set to:', loopPlaylistCheckbox.checked);
    });

    loopSongCheckbox.addEventListener('change', function() {
        currentSound.loop = loopSongCheckbox.checked;
        console.log('Loop song set to:', loopSongCheckbox.checked);
    });

    // Update playback speed
    speedInput.addEventListener('change', function() {
        currentSound.playbackRate = parseFloat(speedInput.value);
        console.log('Playback speed set to:', speedInput.value);
    });

    // Handle audio end event
    currentSound.addEventListener('ended', function() {
        if (loopSongCheckbox.checked) {
            playTrack(currentTrackIndex); // Repeat current track
        } else {
            playNextTrack(); // Play next track
        }
    });

    // Add audio element for fart noise
    const fartAudio = new Audio('fart.mp3'); // Ensure this path is correct

    // Add event listener for keydown
    document.addEventListener('keydown', function(event) {
        if (event.key.toLowerCase() === 'f' && document.activeElement.tagName !== 'INPUT') {
            event.preventDefault(); // Optional: prevent default action
            fartAudio.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    });

    // Confirm description button functionality
    confirmDescriptionButton.addEventListener('click', function() {
        const description = descriptionInput.value;
        if (currentTrackIndex >= 0 && currentTrackIndex < audioFiles.length) {
            audioFiles[currentTrackIndex].description = description;
            updatePlaylist(); // Update the playlist to show the new description
        }
    });

    // Optional: clear description input when updating description
    descriptionInput.addEventListener('input', function() {
        // Optional functionality here if needed
    });
});
