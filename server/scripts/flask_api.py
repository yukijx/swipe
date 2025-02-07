from flask import Flask, request, jsonify
import numpy as np
import openai 
from sklearn.metrics.pairwise import cosine_similarity

