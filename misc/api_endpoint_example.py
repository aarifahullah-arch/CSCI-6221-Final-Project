 api_endpoint_example.py

# How the code integrates with the backend API

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from resume_parser import parse_resume_for_api

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload-resume', methods=['POST'])
def upload_resume():
    """API endpoint for resume upload and parsing"""
    
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['resume']
    
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': f'File type not allowed. Allowed: {ALLOWED_EXTENSIONS}'}), 400
    
    # Save file temporarily
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Parse resume using Saviour's function
    result = parse_resume_for_api(filepath)
    
    # Clean up temp file
    os.remove(filepath)
    
    if result['status'] == 'success':
        return jsonify({
            'message': 'Resume parsed successfully',
            'resume_text': result['resume_text'],
            'format': result['format'],
            'contact_info': result['contact_info'],
            'word_count': len(result['resume_text'].split())
        }), 200
    else:
        return jsonify({'error': result['error']}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
