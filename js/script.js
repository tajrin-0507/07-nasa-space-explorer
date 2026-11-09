// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const spaceFact = document.getElementById('spaceFact');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModalButton');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// The shared DEMO_KEY lets this project use APOD without a personal API key.
// Replace it with your own key only if you need higher request limits.
const apiKey = 'DEMO_KEY';

const spaceFacts = [
  'A day on Venus is longer than its year.',
  'Neutron stars can spin hundreds of times every second.',
  'The footprints left by Apollo astronauts can last for millions of years.',
  'Saturn is less dense than water, so it would float in a large enough ocean.',
  'Light from the Sun takes about eight minutes to reach Earth.'
];

spaceFact.textContent = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

function showMessage(message, role = 'status') {
  const messageElement = document.createElement('div');
  messageElement.className = 'placeholder';
  messageElement.setAttribute('role', role);

  const textElement = document.createElement('p');
  textElement.textContent = message;
  messageElement.append(textElement);
  gallery.replaceChildren(messageElement);
}

function openImageModal(item) {
  modalImage.src = item.hdurl || item.url;
  modalImage.alt = item.alt || item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  imageModal.showModal();
}

function displayImages(items) {
  const displayableItems = items.filter((item) => (
    (item.media_type === 'image' && (item.hdurl || item.url)) ||
    (item.media_type === 'video' && item.url)
  ));

  if (displayableItems.length === 0) {
    showMessage('No images were found for this date range.');
    return;
  }

  const cards = displayableItems.map((item) => {
    const card = document.createElement('article');
    card.className = 'gallery-item';

    if (item.media_type === 'image') {
      const previewButton = document.createElement('button');
      previewButton.className = 'gallery-preview';
      previewButton.type = 'button';
      previewButton.setAttribute('aria-label', `View details for ${item.title}`);
      previewButton.addEventListener('click', () => openImageModal(item));

      const image = document.createElement('img');
      image.src = item.hdurl || item.url;
      image.alt = item.alt || item.title;
      previewButton.append(image);
      card.append(previewButton);
    } else {
      const videoLabel = document.createElement('p');
      videoLabel.className = 'video-label';
      videoLabel.textContent = 'APOD Video';
      card.append(videoLabel);
    }

    const title = document.createElement('h2');
    title.textContent = item.title;

    const date = document.createElement('p');
    date.textContent = item.date;

    card.append(title, date);
    if (item.media_type === 'video') {
      const videoLink = document.createElement('a');
      videoLink.href = item.url;
      videoLink.target = '_blank';
      videoLink.rel = 'noopener noreferrer';
      videoLink.textContent = 'Watch this APOD video';
      card.append(videoLink);
    }
    return card;
  });

  gallery.replaceChildren(...cards);
}

closeModalButton.addEventListener('click', () => imageModal.close());

imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) {
    imageModal.close();
  }
});

getImagesButton.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showMessage('Choose both a start date and an end date.', 'alert');
    return;
  }

  if (startDate > endDate) {
    showMessage('The start date must be on or before the end date.', 'alert');
    return;
  }

  const query = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    api_key: apiKey
  });

  getImagesButton.disabled = true;
  showMessage('Loading space images...');

  try {
    const response = await fetch(`https://science.nasa.gov/wp-json/wp/v2/apod-basic/?${query}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(
        data.error?.message ||
        data.message ||
        `NASA API request failed (${response.status}).`
      );
    }

    if (!Array.isArray(data) && (typeof data !== 'object' || data === null)) {
      throw new Error('NASA returned an unexpected response.');
    }

    const items = Array.isArray(data) ? data : [data];
    displayImages(items);
  } catch (error) {
    showMessage(`Unable to load space images: ${error.message}`, 'alert');
  } finally {
    getImagesButton.disabled = false;
  }
});
