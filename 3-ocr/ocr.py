import cv2
import pytesseract
from PIL import Image
from spellchecker import SpellChecker

# Initialize the SpellChecker
spell = SpellChecker()


# Function for image preprocessing
def preprocess_image(image_path):
    # Load the image
    image = cv2.imread(image_path)

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Apply adaptive thresholding to binarize the image
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Perform dilation to emphasize text features
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    dilated = cv2.dilate(thresh, kernel, iterations=1)

    return dilated


# Function for performing OCR with advanced configuration
def ocr(image_path):
    # Preprocess the image
    processed_image = preprocess_image(image_path)

    # Advanced Tesseract configuration
    custom_config = (
        r"--oem 3 --psm 6"  # OCR Engine Mode (OEM) and Page Segmentation Mode (PSM)
    )

    # Perform OCR on the processed image
    text = pytesseract.image_to_string(processed_image, config=custom_config)

    return text


# Function for post-processing text (spell checking)
def post_process_text(text):
    # Split the text into words
    words = text.split()

    # Check for misspelled words
    misspelled = spell.unknown(words)

    # Correct the misspelled words
    for word in misspelled:
        corrected_word = spell.correction(word)
        text = text.replace(word, corrected_word)

    return text


# Main function
def main():
    # Path to the image you want to process
    image_path = "a.png"

    # Perform OCR on the image
    text = ocr(image_path)

    # Post-process the text for spelling corrections
    corrected_text = post_process_text(text)

    # Output the recognized and corrected text
    print("Recognized and Corrected Text: ")
    print(corrected_text)


if __name__ == "__main__":
    main()
