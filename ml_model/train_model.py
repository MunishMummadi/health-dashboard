import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Define features and target
numerical_features = ['age', 'lengthOfStay', 'totalConditions', 'totalMedications', 'totalProcedures']
categorical_features = ['gender', 'race', 'ethnicity']
boolean_features = ['hasDiabetes', 'hasHypertension', 'hasHeartDisease', 'hasCopd', 'hasAsthma', 'hasCancer']
target = 'isReadmission'

# Get the directory of the current script
script_dir = os.path.dirname(os.path.realpath(__file__))
model_path = os.path.join(script_dir, 'readmission_model.joblib')
preprocessor_path = os.path.join(script_dir, 'preprocessor.joblib')

def generate_synthetic_data(num_samples=1000):
    """Generates a DataFrame with synthetic patient data."""
    data = {}
    data['age'] = np.random.randint(20, 90, num_samples)
    data['lengthOfStay'] = np.random.randint(1, 30, num_samples)
    data['totalConditions'] = np.random.randint(0, 10, num_samples)
    data['totalMedications'] = np.random.randint(0, 25, num_samples)
    data['totalProcedures'] = np.random.randint(0, 5, num_samples)

    for feat in boolean_features:
        data[feat] = np.random.choice([True, False], num_samples)

    data['gender'] = np.random.choice(['M', 'F'], num_samples)
    data['race'] = np.random.choice(['white', 'black', 'asian', 'hispanic', 'native', 'other', 'hawaiian'], num_samples)
    data['ethnicity'] = np.random.choice(['nonhispanic', 'hispanic'], num_samples)

    # Simple heuristic for target - THIS IS NOT REALISTIC
    # Example: Higher age, more conditions/meds -> higher readmission chance
    prob_readmission = (data['age'] / 100 + 
                        data['totalConditions'] / 20 + 
                        data['totalMedications'] / 50 + 
                        np.random.rand(num_samples) * 0.5) # Add noise
    data['isReadmission'] = (prob_readmission > np.median(prob_readmission)).astype(bool) # Balance classes roughly

    df = pd.DataFrame(data)
    # Ensure boolean columns are bool type
    for col in boolean_features + [target]:
        df[col] = df[col].astype(bool)
        
    # Add dummy id columns present in PatientRecord
    df['id'] = range(num_samples)
    df['patientId'] = [f'PAT_{i}' for i in range(num_samples)]

    return df


def train_and_save_model(df):
    """Trains a model and saves it along with the preprocessor."""
    print("Starting model training...")

    X = df[numerical_features + categorical_features + boolean_features]
    y = df[target]

    # Create preprocessing pipelines for numerical and categorical features
    # Use StandardScaler for numerical features
    # Use OneHotEncoder for categorical features (handle unknown values)
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('bool', 'passthrough', boolean_features) # Keep boolean features as they are (True/False -> 1/0)
        ],
        remainder='drop' # Drop any columns not specified
    )

    # Create the full pipeline including preprocessing and the model
    # Note: We are fitting the preprocessor here and saving it separately
    #       because predict.py uses StandardScaler directly.
    #       For consistency, let's fit and save StandardScaler separately.

    # --- Fit the Preprocessor --- 
    print("Fitting the preprocessor...")
    preprocessor.fit(X) # Fit on the raw features
    print(f"Saving preprocessor to {preprocessor_path}")
    joblib.dump(preprocessor, preprocessor_path) # Save the fitted preprocessor
    # --- End Preprocessor Fitting/Saving --- 

    # --- Transform the data using the fitted preprocessor ---
    print("Transforming data using the preprocessor...")
    X_processed = preprocessor.transform(X)
    # ---------------------------------------------------------
    
    # Train the Logistic Regression model on the fully preprocessed data
    print("Training Logistic Regression model...")
    model = LogisticRegression(random_state=42, max_iter=1000)
    # Train on the output of the preprocessor
    model.fit(X_processed, y) 

    print(f"Saving model to {model_path}")
    joblib.dump(model, model_path)

    print("Training complete. Model and preprocessor saved.") 


if __name__ == '__main__':
    print("Generating synthetic data...")
    synthetic_df = generate_synthetic_data(num_samples=2000)
    # print("Sample synthetic data:")
    # print(synthetic_df.head())
    # print("\nData Info:")
    # synthetic_df.info()
    # print("\nTarget distribution:")
    # print(synthetic_df['isReadmission'].value_counts(normalize=True))
    
    train_and_save_model(synthetic_df)
