from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import GridSearchCV
from sklearn.model_selection import StratifiedKFold
from collections import Counter
from data.training_data import training_data

nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')

def preprocess(text):
    tokens = word_tokenize(text)
    tokens = [word.lower() for word in tokens if word.isalpha()]
    tokens = [word for word in tokens if word not in stopwords.words('english')]
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    return ' '.join(tokens)

X = [preprocess(text) for text, intent in training_data]
y = [intent for text, intent in training_data]

class_counts = Counter(y)
n_splits = min(5, min(class_counts.values())) 

if n_splits < 2:
        raise ValueError("The number of splits (n_splits) must be at least 2 for cross-validation.")
    
pipeline = make_pipeline(
    TfidfVectorizer(),
    SVC(kernel='linear', probability=True)
)

parameters = {
    'tfidfvectorizer__max_df': [0.9, 1.0],
    'tfidfvectorizer__min_df': [1, 2],
    'svc__C': [0.1, 1, 10]
}

cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
grid_search = GridSearchCV(pipeline, parameters, cv=cv, n_jobs=-1)
grid_search.fit(X, y)
classifier = grid_search.best_estimator_

def classify_intent(query):
    query_processed = preprocess(query)
    intent = classifier.predict([query_processed])[0]
    return intent
