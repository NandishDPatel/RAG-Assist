# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import sounddevice as sd
# import scipy.io.wavfile as wav
# import numpy as np
# import os
# from dotenv import load_dotenv
# from google.cloud import speech

# load_dotenv()

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# SAMPLE_RATE = 16000
# AUDIO_FILENAME = "../assets/recorded_audio.wav"

# credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
# if credentials_path and os.path.exists(credentials_path):
#     os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
#     client = speech.SpeechClient()
# else:
#     client = None

# audio_data = None
# recording = False

# @app.post("/start-recording")
# def start_recording():
#     global recording, audio_data
#     try:
#         recording = True
#         audio_data = sd.rec(
#             int(30 * SAMPLE_RATE),
#             samplerate=SAMPLE_RATE,
#             channels=1,
#             dtype='int16',
#             blocking=False
#         )
#         return {"status": "success", "message": "Recording started"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# @app.post("/stop-recording")
# def stop_recording():
#     global recording, audio_data
#     try:
#         recording = False
#         sd.stop()

#         if audio_data is not None:
#             if audio_data.ndim > 1:
#                 audio_data = audio_data.flatten()

#             wav.write(AUDIO_FILENAME, SAMPLE_RATE, audio_data)

#             # Transcribe
#             if client and os.path.exists(AUDIO_FILENAME):
#                 with open(AUDIO_FILENAME, "rb") as audio_file:
#                     content = audio_file.read()

#                 audio = speech.RecognitionAudio(content=content)
#                 config = speech.RecognitionConfig(
#                     encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
#                     sample_rate_hertz=SAMPLE_RATE,
#                     language_code="en-US",
#                 )

#                 response = client.recognize(config=config, audio=audio)
#                 transcripts = [result.alternatives[0].transcript for result in response.results]

#                 transcript = " ".join(transcripts) if transcripts else "No speech detected"
#                 return {"status": "success", "transcript": transcript}

#         return {"status": "error", "message": "Recording failed"}

#     except Exception as e:
#         return {"status": "error", "message": str(e)}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)

import sounddevice as sd
import scipy.io.wavfile as wav
import numpy as np
import os
from google.cloud import speech

SAMPLE_RATE = 16000
AUDIO_FILENAME = "recorded_audio.wav"

# Initialize speech client
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if credentials_path and os.path.exists(credentials_path):
    client = speech.SpeechClient()
else:
    client = None

audio_data = None
recording = False


def start_recording():
    """Start voice recording"""
    global recording, audio_data
    try:
        recording = True
        audio_data = sd.rec(
            int(30 * SAMPLE_RATE),  # Max 30 seconds
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype="int16",
            blocking=False,
        )
        return {"status": "success", "message": "Recording started"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def stop_recording():
    """Stop recording and transcribe audio"""
    global recording, audio_data
    try:
        recording = False
        sd.stop()  # Stop recording

        if audio_data is not None:
            # Process audio data
            if audio_data.ndim > 1:
                audio_data_flat = audio_data.flatten()
            else:
                audio_data_flat = audio_data

            # Save to file
            wav.write(AUDIO_FILENAME, SAMPLE_RATE, audio_data_flat)

            # Transcribe if client is available
            if client and os.path.exists(AUDIO_FILENAME):
                with open(AUDIO_FILENAME, "rb") as audio_file:
                    content = audio_file.read()

                audio = speech.RecognitionAudio(content=content)
                config = speech.RecognitionConfig(
                    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                    sample_rate_hertz=SAMPLE_RATE,
                    language_code="en-US",
                    enable_automatic_punctuation=True,
                )

                response = client.recognize(config=config, audio=audio)
                transcripts = [
                    result.alternatives[0].transcript for result in response.results
                ]

                transcript = (
                    " ".join(transcripts) if transcripts else "No speech detected"
                )
                return {
                    "status": "success",
                    "transcript": transcript,
                    "audio_file": AUDIO_FILENAME,
                }

        return {"status": "error", "message": "No audio data recorded"}

    except Exception as e:
        return {"status": "error", "message": str(e)}
