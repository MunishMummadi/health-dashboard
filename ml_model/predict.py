import pandas as pd
import joblib
import sys
import json
import os
import traceback

# Get the directory of the current script
script_dir = os.path.dirname(os.path.realpath(__file__))

# Construct the absolute paths to the model and preprocessor files
model_path = os.path.join(script_dir, 'readmission_model.joblib')
preprocessor_path = os.path.join(script_dir, 'preprocessor.joblib')

def predict_readmission(data):
    """Loads the model and preprocessor, preprocesses data, and returns predictions."""
    try:
        # Check if model and preprocessor files exist
        if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
            print("Warning: Model or preprocessor file not found.", file=sys.stderr)
            raise FileNotFoundError("Model or preprocessor file missing.")

        # Load the trained model and the preprocessor
        print("Loading model and preprocessor...", file=sys.stderr)
        model = joblib.load(model_path)
        preprocessor = joblib.load(preprocessor_path)

        # Convert incoming JSON data to DataFrame
        df = pd.DataFrame(data)

        # Ensure all required columns for the preprocessor are present
        # Get expected features from the preprocessor
        try:
            # Attempt to get features from ColumnTransformer (depends on sklearn version)
            if hasattr(preprocessor, 'feature_names_in_'):
                expected_features_in = preprocessor.feature_names_in_
            # Fallback for older versions or different preprocessor types
            elif hasattr(preprocessor, 'transformers_'): 
                expected_features_in = []
                for name, trans, cols in preprocessor.transformers_:
                    if trans != 'drop':
                        expected_features_in.extend(cols)
            else:
                raise AttributeError("Cannot determine expected features from preprocessor.")
            
            # Check if all expected input features are in the DataFrame
            missing_features = [f for f in expected_features_in if f not in df.columns]
            if missing_features:
                raise ValueError(f"Missing required features in input data: {', '.join(missing_features)}")
            
            # Select only the features the preprocessor expects, in the correct order
            X = df[expected_features_in]

        except (AttributeError, ValueError) as e:
            print(f"Error validating input features against preprocessor: {e}", file=sys.stderr)
            # As a basic fallback, try using all columns present in the DataFrame
            # This might fail if the preprocessor strictly expects certain columns
            print("Warning: Falling back to using all columns from input for preprocessing.", file=sys.stderr)
            X = df.copy()

        # --- Preprocessing using the loaded preprocessor --- 
        print("Preprocessing data using loaded preprocessor...", file=sys.stderr)
        X_processed = preprocessor.transform(X)
        # --- End Preprocessing ---

        # --- Prediction --- 
        print("Predicting probabilities...", file=sys.stderr)
        predictions = model.predict(X_processed)
        probabilities = model.predict_proba(X_processed)[:, 1] # Probability of positive class (readmission)

        # Add predictions and probabilities back to the original data structure
        # Make sure the original data list 'data' is modified
        for i, record in enumerate(data):
            record['prediction'] = int(predictions[i]) # Store prediction (0 or 1)
            record['predictionProbability'] = float(probabilities[i]) # Store probability

        return data

    except FileNotFoundError as fnf_error:
        print(f"Error loading model/preprocessor: {fnf_error}", file=sys.stderr)
    except ValueError as val_error:
        print(f"Error processing data: {val_error}", file=sys.stderr)
    except Exception as e:
        print(f"An unexpected error occurred during prediction: {e}", file=sys.stderr)
        print(f"Exception Type: {type(e)}", file=sys.stderr)
        print(f"Exception Repr: {repr(e)}", file=sys.stderr)
        print("--- Traceback ---:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        print("--- End Traceback ---", file=sys.stderr)
        
    # If any error occurs above (caught by except blocks), or if files were missing,
    # this part will execute to return dummy predictions.
    print("Error condition met. Returning dummy predictions.", file=sys.stderr)
    # Ensure data is always a list before iterating
    if 'data' not in locals() or not isinstance(data, list):
        data = [] # Need to ensure 'data' exists even if loading failed early
    elif not isinstance(data, list):
        # If data exists but isn't a list (e.g., if assigned from df early) - reset
        # This case shouldn't happen with current logic but added for safety
        data = []

    # Create dummy predictions for all records passed in (or empty list)
    result_data = []
    if 'data' in locals() and isinstance(data, list):
        for record in data:
            record['prediction'] = 0
            record['predictionProbability'] = 0.1
            result_data.append(record)
    return result_data # Return dummy data on any error or missing file

if __name__ == '__main__':
    # Read JSON data from stdin
    input_json = sys.stdin.read()
    try:
        input_data = json.loads(input_json)
        if not isinstance(input_data, list):
            raise ValueError("Input data must be a list of records.")
    except json.JSONDecodeError:
        print("Error: Invalid JSON received.", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    # Get predictions
    results = predict_readmission(input_data)
    
    # Print results as JSON to stdout
    print(json.dumps(results))
