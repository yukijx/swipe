from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import openai
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import os
import PyPDF2
from io import BytesIO

# Load environment variables
load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
CORS(app)

def get_embedding(text):
    """Get embedding from OpenAI API"""
    response = openai.Embedding.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response['data'][0]['embedding']

def calculate_match_score(student_cv, job_description):
    """Calculate similarity score between student CV and job description"""
    try:
        # Get embeddings for both texts
        cv_embedding = get_embedding(student_cv)
        job_embedding = get_embedding(job_description)
        
        # Convert to numpy arrays and reshape
        cv_vector = np.array(cv_embedding).reshape(1, -1)
        job_vector = np.array(job_embedding).reshape(1, -1)
        
        # Calculate cosine similarity
        similarity = cosine_similarity(cv_vector, job_vector)[0][0]
        
        # Convert to percentage and round to 2 decimal places
        match_percentage = round(similarity * 100, 2)
        
        return match_percentage
    except Exception as e:
        print(f"Error calculating match score: {str(e)}")
        return 0

@app.route('/match', methods=['POST'])
def match():
    try:
        data = request.json
        student_cv = data.get('student_cv', '')
        job_description = data.get('job_description', '')
        
        if not student_cv or not job_description:
            return jsonify({'error': 'Missing required fields'}), 400
            
        match_score = calculate_match_score(student_cv, job_description)
        
        return jsonify({
            'match_score': match_score,
            'should_show': match_score >= 70  # Only show matches above 70%
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/parse-resume', methods=['POST'])
def parse_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if file and file.filename.endswith('.pdf'):
            # Read PDF file
            pdf_reader = PyPDF2.PdfReader(BytesIO(file.read()))
            
            # Extract text from all pages
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()

            return jsonify({
                'text': text,
                'message': 'PDF parsed successfully'
            })
        else:
            return jsonify({'error': 'Invalid file format'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)

