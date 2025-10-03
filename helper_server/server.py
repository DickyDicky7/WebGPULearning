# cd helper_server; python -m venv venv
# cd helper_server; python -m venv venv

# pip install -r requirements.txt
# pip install -r requirements.txt

# pip uninstall -r requirements.txt -y
# pip uninstall -r requirements.txt -y

# which python
# which python

# cd helper_server; .\venv/Scripts/activate.ps1
# cd helper_server; .\venv/Scripts/activate.ps1

# pip install --upgrade -r requirements.txt
# pip install --upgrade -r requirements.txt

# pip list --outdated | Select-Object -Skip 2 | ForEach-Object { pip install -U ($_.Split(" ")[0]) }
# pip list --outdated | Select-Object -Skip 2 | ForEach-Object { pip install -U ($_.Split(" ")[0]) }

# uvicorn server:app --reload
# uvicorn server:app --reload

#
#
# To run this server:
# To run this server:
# 1. Create and activate a virtual environment:
# 1. Create and activate a virtual environment:
#    python -m venv venv
#    python -m venv venv
#    .\venv\Scripts\activate  (Windows) or source venv/bin/activate (Linux/macOS)
#    .\venv\Scripts\activate  (Windows) or source venv/bin/activate (Linux/macOS)
#
#
# 2. Install dependencies:
# 2. Install dependencies:
#    pip install -r requirements.txt
#    pip install -r requirements.txt
#
#
# 3. Start the server:
# 3. Start the server:
#    uvicorn server:app --reload
#    uvicorn server:app --reload
#
#

import io
import io
import struct
import struct
import numpy as np
import numpy as np
import pyvips
import pyvips
import OpenEXR
import OpenEXR
import Imath
import Imath

from fastapi import FastAPI, File, UploadFile
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import Response
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

# --- FastAPI App Initialization ---
# --- FastAPI App Initialization ---
app = FastAPI     (
)
app.add_middleware(
    CORSMiddleware,
#   CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
#   allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
#   allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
#   allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
#   allow_headers=["*"],  # Allows all headers
)

# --- Image Loading Functions ---
# --- Image Loading Functions ---

def load_ldr(data: bytes):
    """
    Loads an LDR image (PNG, JPG) from bytes, normalizes it to a 0.0-1.0 float range,
    Loads an LDR image (PNG, JPG) from bytes, normalizes it to a 0.0-1.0 float range,
    and returns it as a NumPy array with metadata. This version is robust against
    and returns it as a NumPy array with metadata. This version is robust against
    various underlying image formats.
    various underlying image formats.
    """
    image = pyvips.Image.new_from_buffer(data, "")
#   image = pyvips.Image.new_from_buffer(data, "")

    # 1. Store the original format to determine the correct max value for normalization.
    # 1. Store the original format to determine the correct max value for normalization.
    original_format = image.format
#   original_format = image.format

    # 2. Determine the correct scaling factor based on the ORIGINAL format.
    # 2. Determine the correct scaling factor based on the ORIGINAL format.
    format_to_max_value = {
#   format_to_max_value = {
        'uchar': 255.0,    #  8-bit (0-255  )
#       'uchar': 255.0,    #  8-bit (0-255  )
        'ushort': 65535.0, # 16-bit (0-65535)
#       'ushort': 65535.0, # 16-bit (0-65535)
    }
    # If the format is not in our map (e.g., it's already 'float'),
    # If the format is not in our map (e.g., it's already 'float'),
    # we won't scale it. Defaulting to 1.0 is a safe no-op.
    # we won't scale it. Defaulting to 1.0 is a safe no-op.
    max_value = format_to_max_value.get(original_format, 1.0)
#   max_value = format_to_max_value.get(original_format, 1.0)
    
    # 3. CRITICAL: Cast the image to a standard format ('float') for processing.
    # 3. CRITICAL: Cast the image to a standard format ('float') for processing.
    # This prevents errors with unsupported dtype lookups and ensures consistency.
    # This prevents errors with unsupported dtype lookups and ensures consistency.
    # When casting from int to float, pyvips preserves the numerical range (e.g., 255 -> 255.0).
    # When casting from int to float, pyvips preserves the numerical range (e.g., 255 -> 255.0).
    if image.format != 'float':
#   if image.format != 'float':
        image = image.cast('float')
#       image = image.cast('float')

    # 4. Now that we've guaranteed the format is 'float', we can safely create
    # 4. Now that we've guaranteed the format is 'float', we can safely create
    #    a float32 numpy array.
    #    a float32 numpy array.
    arr = np.ndarray(
#   arr = np.ndarray(
        buffer=image.write_to_memory(),
#       buffer=image.write_to_memory(),
        dtype=np.float32,
#       dtype=np.float32,
        shape=[image.height, image.width, image.bands]
#       shape=[image.height, image.width, image.bands]
    )

    # 5. Normalize the array using the max_value from the original format.
    # 5. Normalize the array using the max_value from the original format.
    # This check ensures we don't divide images that are already in a 0-1 float range.
    # This check ensures we don't divide images that are already in a 0-1 float range.
    if max_value > 1.0:
#   if max_value > 1.0:
        arr = arr / max_value
#       arr = arr / max_value

    return arr, image.width, image.height, image.bands
#   return arr, image.width, image.height, image.bands


def load_exr(data: bytes):
    """
    Loads an HDR image (EXR) from bytes and returns it as a NumPy array.
    Loads an HDR image (EXR) from bytes and returns it as a NumPy array.
    This function performs the entire operation in memory, avoiding slow disk I/O.
    This function performs the entire operation in memory, avoiding slow disk I/O.
    The output range is 0.0 to >1.0.
    The output range is 0.0 to >1.0.
    """
    # Use an in-memory byte stream instead of a temporary file for performance
    # Use an in-memory byte stream instead of a temporary file for performance
    stream = io.BytesIO(data)
#   stream = io.BytesIO(data)
    exr = OpenEXR.InputFile(stream)
#   exr = OpenEXR.InputFile(stream)

    header = exr.header()
#   header = exr.header()
    dw = header["dataWindow"]
#   dw = header["dataWindow"]
    width  = dw.max.x - dw.min.x + 1
#   width  = dw.max.x - dw.min.x + 1
    height = dw.max.y - dw.min.y + 1
#   height = dw.max.y - dw.min.y + 1

    # Define the pixel type we want to read (32-bit float)
    # Define the pixel type we want to read (32-bit float)
    FLOAT = Imath.PixelType(Imath.PixelType.FLOAT)
#   FLOAT = Imath.PixelType(Imath.PixelType.FLOAT)
    
    # Read the R, G, B channels as 32-bit float arrays
    # Read the R, G, B channels as 32-bit float arrays
    channels_bytes = exr.channels(["R", "G", "B"], FLOAT)
#   channels_bytes = exr.channels(["R", "G", "B"], FLOAT)
    
    r = np.frombuffer(channels_bytes[0], dtype=np.float32)
#   r = np.frombuffer(channels_bytes[0], dtype=np.float32)
    g = np.frombuffer(channels_bytes[1], dtype=np.float32)
#   g = np.frombuffer(channels_bytes[1], dtype=np.float32)
    b = np.frombuffer(channels_bytes[2], dtype=np.float32)
#   b = np.frombuffer(channels_bytes[2], dtype=np.float32)

    # Reshape and stack the channels to form the final (H, W, C) image
    # Reshape and stack the channels to form the final (H, W, C) image
    arr = np.stack((r.reshape(height, width), g.reshape(height, width), b.reshape(height, width)), axis=-1)
#   arr = np.stack((r.reshape(height, width), g.reshape(height, width), b.reshape(height, width)), axis=-1)

    return arr, width, height, 3
#   return arr, width, height, 3

# --- API Endpoint ---
# --- API Endpoint ---

@app.post("/process-image")
async def   process_image (file: UploadFile = File(...)):
    """
    Receives an image file, processes it into a standard float32 NumPy array format,
    Receives an image file, processes it into a standard float32 NumPy array format,
    and returns it as a binary blob with a simple header.
    and returns it as a binary blob with a simple header.
    Header: 12 bytes (int: width, int: height, int: channels)
    Header: 12 bytes (int: width, int: height, int: channels)
    Body:   width * height * channels * 4 bytes (raw float32 data)
    Body:   width * height * channels * 4 bytes (raw float32 data)
    """
    data = await file.read()
#   data = await file.read()
    filename = file.filename or ""
#   filename = file.filename or ""
    ext = filename.split(".")[-1].lower()
#   ext = filename.split(".")[-1].lower()

    try:
#   try:
        if ext in ["png", "jpg", "jpeg"]:
#       if ext in ["png", "jpg", "jpeg"]:
            arr, w, h, c = load_ldr(data)
#           arr, w, h, c = load_ldr(data)
        elif ext == "exr":
#       elif ext == "exr":
            arr, w, h, c = load_exr(data)
#           arr, w, h, c = load_exr(data)
        else:
#       else:
            return Response(
#           return Response(
                content=f"Unsupported format: {ext}",
#               content=f"Unsupported format: {ext}",
                media_type="text/plain",
#               media_type="text/plain",
                status_code=400
#               status_code=400
            )
    except Exception as e:
#   except Exception as e:
        # Catch potential processing errors (e.g., corrupted file)
        # Catch potential processing errors (e.g., corrupted file)
        return Response(
#       return Response(
            content=f"Error processing image: {e}",
#           content=f"Error processing image: {e}",
            media_type="text/plain",
#           media_type="text/plain",
            status_code=500
#           status_code=500
        )

    # Flatten the array and pack the data into a binary response
    # Flatten the array and pack the data into a binary response
    flat_arr = arr.flatten()
#   flat_arr = arr.flatten()
    header = struct.pack("iii", w, h, c) # 3 integers = 12 bytes
#   header = struct.pack("iii", w, h, c) # 3 integers = 12 bytes
    body = flat_arr.tobytes()
#   body = flat_arr.tobytes()

    return Response(content=header + body, media_type="application/octet-stream")
#   return Response(content=header + body, media_type="application/octet-stream")
