"""
SHAP Explainability Module
Generates feature importance explanations for AI predictions.
"""

import shap
import numpy as np


class ExplainabilityEngine:
    """Provides SHAP-based explanations for model predictions."""

    def __init__(self, model, feature_cols):
        self.model = model
        self.feature_cols = feature_cols
        # Use TreeExplainer for Random Forest
        self.explainer = shap.TreeExplainer(model)

    def explain(self, features_array):
        """
        Generate SHAP explanation for a single prediction.

        Args:
            features_array: numpy array of shape (1, n_features)

        Returns:
            dict with important_features and natural language explanation
        """
        shap_values = self.explainer.shap_values(features_array)

        # Get prediction class
        prediction = self.model.predict(features_array)[0]

        # SHAP values for the predicted class
        if isinstance(shap_values, list):
            class_shap = shap_values[prediction][0]
        else:
            class_shap = shap_values[0]

        # Build feature importance list
        feature_impacts = []
        for i, (feat, impact) in enumerate(zip(self.feature_cols, class_shap)):
            feature_impacts.append({
                'feature': feat,
                'impact': round(float(abs(impact)), 4),
                'direction': 'positive' if impact > 0 else 'negative',
                'raw_impact': round(float(impact), 4)
            })

        # Sort by absolute impact
        feature_impacts.sort(key=lambda x: x['impact'], reverse=True)

        # Take top features
        top_features = feature_impacts[:5]

        # Generate natural language explanation
        explanation = self._generate_explanation(top_features, prediction)

        return {
            'important_features': top_features,
            'all_features': feature_impacts,
            'explanation': explanation,
            'predicted_class': int(prediction)
        }

    def _generate_explanation(self, top_features, prediction):
        """Convert SHAP values into natural language explanation."""
        label_map = {0: 'valid', 1: 'suspicious', 2: 'spam'}
        label = label_map.get(prediction, 'unknown')

        feature_descriptions = {
            'rating': 'the overall rating given',
            'food_quality': 'the food quality score',
            'cleanliness': 'the cleanliness score',
            'service': 'the service quality score',
            'rating_variance': 'the deviation from average hostel ratings',
            'review_frequency': 'the number of reviews submitted recently',
            'ip_similarity': 'multiple submissions from the same IP address',
            'hostel_avg_rating': 'the average rating for this hostel',
            'rating_spike': 'a sudden spike in negative ratings'
        }

        if label == 'valid':
            explanation = 'This review appears to be genuine. '
        elif label == 'suspicious':
            explanation = 'This review was flagged as suspicious. '
        else:
            explanation = 'This review was classified as spam. '

        reasons = []
        for feat in top_features[:3]:
            desc = feature_descriptions.get(feat['feature'], feat['feature'])
            if feat['impact'] > 0.1:
                reasons.append(f"{desc} (impact: {feat['impact']:.2f})")

        if reasons:
            explanation += 'Key factors: ' + '; '.join(reasons) + '.'
        else:
            explanation += 'No single feature dominated the decision.'

        return explanation
