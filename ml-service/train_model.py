"""
Train and save the ML model for review classification.
Run this script once to generate model.pkl and the training dataset.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

np.random.seed(42)

def generate_dataset(n_samples=2000):
    """Generate synthetic review dataset for training."""
    data = []

    for _ in range(n_samples):
        label_prob = np.random.random()

        if label_prob < 0.60:
            # Valid review
            rating = np.random.choice([3, 4, 5], p=[0.3, 0.4, 0.3])
            food_quality = max(1, min(5, rating + np.random.randint(-1, 2)))
            cleanliness = max(1, min(5, rating + np.random.randint(-1, 2)))
            service = max(1, min(5, rating + np.random.randint(-1, 2)))
            rating_variance = round(np.random.uniform(0, 1.0), 3)
            review_frequency = np.random.randint(0, 3)
            ip_similarity = np.random.randint(0, 2)
            hostel_avg_rating = round(np.random.uniform(2.5, 4.5), 3)
            rating_spike = np.random.randint(0, 3)
            label = 0  # valid

        elif label_prob < 0.80:
            # Suspicious review
            rating = np.random.choice([1, 2, 3], p=[0.3, 0.4, 0.3])
            food_quality = max(1, min(5, rating + np.random.randint(-1, 1)))
            cleanliness = max(1, min(5, np.random.randint(1, 4)))
            service = max(1, min(5, np.random.randint(1, 4)))
            rating_variance = round(np.random.uniform(1.5, 3.0), 3)
            review_frequency = np.random.randint(4, 8)
            ip_similarity = np.random.randint(2, 4)
            hostel_avg_rating = round(np.random.uniform(3.0, 4.0), 3)
            rating_spike = np.random.randint(3, 7)
            label = 1  # suspicious

        else:
            # Spam review
            rating = np.random.choice([1, 5], p=[0.7, 0.3])
            food_quality = np.random.choice([1, 5])
            cleanliness = np.random.choice([1, 5])
            service = np.random.choice([1, 5])
            rating_variance = round(np.random.uniform(2.5, 4.5), 3)
            review_frequency = np.random.randint(8, 20)
            ip_similarity = np.random.randint(4, 10)
            hostel_avg_rating = round(np.random.uniform(2.5, 4.5), 3)
            rating_spike = np.random.randint(7, 15)
            label = 2  # spam

        data.append({
            'rating': rating,
            'food_quality': food_quality,
            'cleanliness': cleanliness,
            'service': service,
            'rating_variance': rating_variance,
            'review_frequency': review_frequency,
            'ip_similarity': ip_similarity,
            'hostel_avg_rating': hostel_avg_rating,
            'rating_spike': rating_spike,
            'label': label
        })

    return pd.DataFrame(data)


def train_model():
    """Train Random Forest model and save it."""
    print("Generating training dataset...")
    df = generate_dataset(2000)

    # Save dataset
    df.to_csv(os.path.join(os.path.dirname(__file__), 'training_data.csv'), index=False)
    print(f"Dataset saved: {len(df)} samples")
    print(f"Label distribution:\n{df['label'].value_counts().to_string()}")

    feature_cols = [
        'rating', 'food_quality', 'cleanliness', 'service',
        'rating_variance', 'review_frequency', 'ip_similarity',
        'hostel_avg_rating', 'rating_spike'
    ]

    X = df[feature_cols]
    y = df['label']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("\nTraining Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        class_weight='balanced'
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    label_names = ['valid', 'suspicious', 'spam']
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=label_names))

    # Feature importance
    importance = dict(zip(feature_cols, model.feature_importances_))
    print("\nFeature Importance:")
    for feat, imp in sorted(importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  {feat}: {imp:.4f}")

    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump({'model': model, 'feature_cols': feature_cols, 'label_names': label_names}, model_path)
    print(f"\nModel saved to {model_path}")


if __name__ == '__main__':
    train_model()
