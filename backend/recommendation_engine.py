import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import requests
import json
import os
from typing import List, Dict, Any

class LLMBookRecommendationEngine:
    def __init__(self, llm_api_key=None):
        self.book_data = None
        self.user_history = None
        self.similarity_matrix = None
        self.llm_api_key = llm_api_key or os.environ.get("LLM_API_KEY")
        self.llm_api_endpoint = "https://api.provider.com/v1/completions"  # Replace with actual endpoint
        
    def load_data(self, catalog_data, borrowing_history):
        """Load and prepare the book catalog and borrowing history data"""
        self.book_data = catalog_data
        self.user_history = borrowing_history
        
        # Calculate traditional similarity matrix for fallback
        self._calculate_similarity_matrix()
        
    def _calculate_similarity_matrix(self):
        """Calculate traditional similarity matrix using book metadata"""
        # This serves as a fallback when LLM is unavailable
        # Simplified version shown here
        from sklearn.feature_extraction.text import TfidfVectorizer
        
        # Combine relevant text features
        self.book_data['combined_features'] = (
            self.book_data['title'] + ' ' + 
            self.book_data['author'] + ' ' + 
            self.book_data['genre'] + ' ' + 
            self.book_data['description']
        )
        
        # Create TF-IDF vectorizer
        tfidf = TfidfVectorizer(stop_words='english')
        
        # Create feature vectors and calculate similarity
        book_features = tfidf.fit_transform(self.book_data['combined_features'])
        self.similarity_matrix = cosine_similarity(book_features)
    
    def _get_llm_response(self, prompt, temperature=0.3, max_tokens=500):
        """Get a response from the LLM API"""
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.llm_api_key}"
            }
            
            payload = {
                "model": "text-embedding-model",  # Use appropriate model
                "prompt": prompt,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            response = requests.post(
                self.llm_api_endpoint,
                headers=headers,
                data=json.dumps(payload)
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["text"]
            else:
                print(f"LLM API error: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error connecting to LLM API: {e}")
            return None

    def generate_semantic_embeddings(self, batch_size=100):
        """Generate semantic embeddings for books using LLM"""
        # Process in batches to avoid API limits
        embeddings = []
        
        for i in range(0, len(self.book_data), batch_size):
            batch = self.book_data.iloc[i:i+batch_size]
            
            for _, book in batch.iterrows():
                prompt = f"""
                Generate a semantic embedding for this book:
                Title: {book['title']}
                Author: {book['author']}
                Genre: {book['genre']}
                Description: {book['description']}
                Reading Level: {book['reading_level']}
                
                Consider themes, writing style, complexity, emotional tone, and target audience.
                """
                
                embedding_response = self._get_llm_response(prompt)
                if embedding_response:
                    # Store embedding with book ID
                    embeddings.append({
                        "book_id": book['book_id'],
                        "embedding": embedding_response
                    })
                else:
                    # Fallback to traditional similarity if LLM is unavailable
                    print(f"Using fallback for book {book['title']}")
        
        # Store embeddings for future use
        self.book_embeddings = pd.DataFrame(embeddings)
        
        return self.book_embeddings
    
    def get_personalized_recommendations(self, student_id, reading_level=None, interests=None, top_n=10):
        """Generate personalized recommendations using LLM"""
        # Get student's reading history
        student_history = self.user_history[self.user_history['student_id'] == student_id]
        
        # Build context about the student
        student_context = self._build_student_context(student_id, student_history, reading_level, interests)
        
        # Generate LLM recommendations
        recommendations = self._generate_llm_recommendations(student_context, top_n)
        
        if not recommendations:
            # Fallback to traditional algorithm if LLM fails
            recommendations = self._get_traditional_recommendations(student_id, reading_level, top_n)
        
        return recommendations
    
    def _build_student_context(self, student_id, student_history, reading_level, interests):
        """Build context about the student for LLM"""
        context = f"Student ID: {student_id}\n"
        
        if not student_history.empty:
            # Add recently read books
            recent_books = student_history.sort_values('checkout_date', ascending=False).head(5)
            recent_book_data = self.book_data[self.book_data['book_id'].isin(recent_books['book_id'])]
            
            context += "Recently read books:\n"
            for _, book in recent_book_data.iterrows():
                context += f"- {book['title']} by {book['author']} ({book['genre']})\n"
            
            # Add reading patterns
            genres = recent_book_data['genre'].value_counts()
            context += "\nReading patterns:\n"
            for genre, count in genres.items():
                context += f"- {genre}: {count} books\n"
        
        # Add reading level if available
        if reading_level:
            context += f"\nReading level: {reading_level}\n"
        
        # Add interests if available
        if interests:
            context += f"\nInterests: {', '.join(interests)}\n"
        
        return context
    
    def _generate_llm_recommendations(self, student_context, top_n):
        """Generate book recommendations using LLM"""
        try:
            # Create a prompt for the LLM
            prompt = f"""
            You are a librarian AI tasked with recommending books to students.
            
            Student information:
            {student_context}
            
            Available books in the library catalog:
            {self._format_book_catalog_sample()}
            
            Based on this student's reading history, interests, and reading level, recommend {top_n} books from the catalog.
            For each book, provide the book_id and a brief explanation of why you're recommending it.
            
            Format your response as a JSON object with the structure:
            {{
                "recommendations": [
                    {{"book_id": "123", "explanation": "This book has similar themes to Harry Potter with..."}},
                    ...
                ]
            }}
            """
            
            response = self._get_llm_response(prompt, temperature=0.7, max_tokens=1000)
            
            if response:
                try:
                    # Parse the JSON response
                    rec_data = json.loads(response)
                    book_ids = [rec['book_id'] for rec in rec_data['recommendations']]
                    explanations = {rec['book_id']: rec['explanation'] for rec in rec_data['recommendations']}
                    
                    # Get the full book data
                    recommendations = self.book_data[self.book_data['book_id'].isin(book_ids)].copy()
                    
                    # Add explanations
                    recommendations['explanation'] = recommendations['book_id'].map(explanations)
                    
                    return recommendations
                except json.JSONDecodeError:
                    print("Error parsing LLM response as JSON")
                    return None
            
            return None
            
        except Exception as e:
            print(f"Error in LLM recommendation generation: {e}")
            return None
    
    def _format_book_catalog_sample(self):
        """Format a sample of the book catalog for the LLM prompt"""
        # Use a sample of books to avoid exceeding context limits
        sample = self.book_data.sample(min(100, len(self.book_data)))
        
        formatted = ""
        for _, book in sample.iterrows():
            formatted += f"book_id: {book['book_id']}, title: {book['title']}, " \
                         f"author: {book['author']}, genre: {book['genre']}, " \
                         f"reading_level: {book['reading_level']}\n"
        
        return formatted
    
    def _get_traditional_recommendations(self, student_id, reading_level, top_n):
        """Fallback to traditional recommendation algorithm"""
        # Simplified collaborative filtering as fallback
        student_history = self.user_history[self.user_history['student_id'] == student_id]
        
        if student_history.empty:
            # If no history, recommend popular books at appropriate reading level
            if reading_level:
                recommendations = self.book_data[
                    self.book_data['reading_level'] == reading_level
                ].sort_values('popularity', ascending=False).head(top_n)
            else:
                recommendations = self.book_data.sort_values('popularity', ascending=False).head(top_n)
        else:
            # Get last read book
            last_book_id = student_history.sort_values('checkout_date', ascending=False)['book_id'].iloc[0]
            last_book_index = self.book_data[self.book_data['book_id'] == last_book_id].index[0]
            
            # Get similarity scores
            similarity_scores = list(enumerate(self.similarity_matrix[last_book_index]))
            similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
            
            # Get indices of similar books (excluding the book itself)
            indices = [i[0] for i in similarity_scores[1:top_n+1]]
            
            # Get recommended books
            recommendations = self.book_data.iloc[indices]
        
        return recommendations
    
    def generate_natural_language_explanation(self, student_id, book_id):
        """Generate natural language explanation for why a book is recommended"""
        student_history = self.user_history[self.user_history['student_id'] == student_id]
        book_data = self.book_data[self.book_data['book_id'] == book_id].iloc[0]
        
        # Build context
        context = ""
        if not student_history.empty:
            recent_books = student_history.sort_values('checkout_date', ascending=False).head(3)
            recent_book_data = self.book_data[self.book_data['book_id'].isin(recent_books['book_id'])]
            
            context += "Recently read books:\n"
            for _, book in recent_book_data.iterrows():
                context += f"- {book['title']} by {book['author']}\n"
        
        # Create prompt
        prompt = f"""
        You are a friendly librarian explaining to a student why they might enjoy a book.
        
        Book information:
        Title: {book_data['title']}
        Author: {book_data['author']}
        Genre: {book_data['genre']}
        Description: {book_data['description']}
        
        {context}
        
        Write a brief, engaging explanation (2-3 sentences) of why this student might enjoy "{book_data['title']}" based on their reading history.
        Keep the explanation conversational and appealing to a young reader.
        """
        
        explanation = self._get_llm_response(prompt, temperature=0.7)
        return explanation if explanation else f"You might enjoy {book_data['title']} based on your interest in {book_data['genre']} books."
    
    def search_by_natural_language(self, query, top_n=5):
        """Allow natural language search of the catalog"""
        prompt = f"""
        You are a librarian AI helping find books that match a student's query.
        
        Student query: "{query}"
        
        Based on this query, identify the key search elements (themes, genres, topics, reading level, etc.)
        Format your response as JSON with the structure:
        {{
            "search_elements": [
                {{"type": "genre", "value": "fantasy"}},
                {{"type": "theme", "value": "friendship"}},
                {{"type": "reading_level", "value": "middle grade"}},
                ...
            ]
        }}
        """
        
        response = self._get_llm_response(prompt, temperature=0.3)
        
        if response:
            try:
                search_data = json.loads(response)
                search_elements = search_data['search_elements']
                
                # Start with all books
                filtered_books = self.book_data.copy()
                
                # Apply filters based on search elements
                for element in search_elements:
                    if element['type'] == 'genre':
                        filtered_books = filtered_books[filtered_books['genre'].str.contains(element['value'], case=False)]
                    elif element['type'] == 'theme':
                        filtered_books = filtered_books[filtered_books['description'].str.contains(element['value'], case=False)]
                    elif element['type'] == 'reading_level':
                        # Map natural language level to system reading levels
                        level_map = {
                            'elementary': ['1-2', '2-3', '3-4'],
                            'middle grade': ['4-5', '5-6', '6-7'],
                            'middle school': ['6-7', '7-8'],
                            'young adult': ['7-8', '8-9', '9+']
                        }
                        
                        if element['value'].lower() in level_map:
                            filtered_books = filtered_books[filtered_books['reading_level'].isin(level_map[element['value'].lower()])]
                    # Add other filter types as needed
                
                # Return top N results
                return filtered_books.head(top_n)
                
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error processing search response: {e}")
                return self._fallback_search(query, top_n)
        
        return self._fallback_search(query, top_n)
    
    def _fallback_search(self, query, top_n):
        """Simple keyword search as fallback"""
        # Split query into keywords
        keywords = query.lower().split()
        
        # Score books based on keyword matches
        scores = []
        for _, book in self.book_data.iterrows():
            text = (f"{book['title']} {book['author']} {book['genre']} "
                   f"{book['description']}").lower()
            
            # Count keyword matches
            score = sum(1 for keyword in keywords if keyword in text)
            scores.append((book['book_id'], score))
        
        # Sort by score
        sorted_scores = sorted(scores, key=lambda x: x[1], reverse=True)
        top_book_ids = [s[0] for s in sorted_scores[:top_n]]
        
        # Return top matches
        return self.book_data[self.book_data['book_id'].isin(top_book_ids)]
    
    def adapt_description_to_reading_level(self, book_id, reading_level):
        """Adapt book description to student's reading level"""
        book_data = self.book_data[self.book_data['book_id'] == book_id].iloc[0]
        
        prompt = f"""
        Rewrite the following book description to be appropriate for a {reading_level} grade reading level.
        Keep it engaging and accurate, but adjust vocabulary and sentence complexity to match the reading level.
        
        Original description:
        {book_data['description']}
        """
        
        adapted_description = self._get_llm_response(prompt, temperature=0.4)
        return adapted_description if adapted_description else book_data['description']