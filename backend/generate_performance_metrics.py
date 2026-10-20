"""
Performance Metrics Generator for Structural Material Decision Support Software (SM-DSS)
Generates:
1. Confusion Matrix
2. Class Distribution
3. Confidence Distribution
4. Learning Curves
5. Model Comparison
6. ROC Curve
Saves all plots into Output/Performance/
"""
import os
import sys

def main():
    print("Initializing environment...", flush=True)
    import numpy as np
    import pandas as pd
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import seaborn as sns

    from sklearn.model_selection import train_test_split, learning_curve, StratifiedKFold
    from sklearn.preprocessing import StandardScaler, label_binarize
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.svm import SVC
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.neural_network import MLPClassifier
    from sklearn.metrics import (
        confusion_matrix,
        roc_curve,
        auc,
        accuracy_score,
        precision_score,
        recall_score,
        f1_score
    )

    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
    CSV_PATH = os.path.join(PROJECT_ROOT, "dataset", "materials_database_1000.csv")
    OUTPUT_DIR = os.path.join(PROJECT_ROOT, "Output", "Performance")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Loading dataset from: {CSV_PATH}", flush=True)
    df = pd.read_csv(CSV_PATH)

    feature_cols = [
        'compressive_strength_mpa',
        'tensile_strength_mpa',
        'density_kg_m3',
        'cost_inr_m3',
        'durability_score',
        'corrosion_resistance_score',
        'fire_resistance_score',
        'co2_emission_kg_m3',
        'maintenance_score'
    ]

    X = df[feature_cols].copy()
    y = df['category'].copy()
    classes = sorted(y.unique())
    n_classes = len(classes)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.25, random_state=42, stratify=y
    )

    # 1. CLASS DISTRIBUTION
    print("1/6 Generating Class Distribution plot...", flush=True)
    plt.figure(figsize=(14, 7), dpi=300)
    class_counts = df['category'].value_counts()
    colors = sns.color_palette("Blues_r", len(class_counts))

    bars = plt.barh(class_counts.index, class_counts.values, color=colors, edgecolor='#1e3a8a', height=0.65)
    plt.title("Structural Material Dataset - Class Distribution (N=1,000 Records)", fontsize=16, fontweight='bold', pad=15, color='#0f172a')
    plt.xlabel("Sample Count", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.ylabel("Civil Engineering Material Category", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.grid(axis='x', linestyle='--', alpha=0.5)

    for bar in bars:
        width = bar.get_width()
        plt.text(width + 1.2, bar.get_y() + bar.get_height()/2, f'{int(width)} ({width/len(df)*100:.1f}%)',
                 va='center', ha='left', fontsize=9.5, fontweight='bold', color='#1e293b')

    plt.xlim(0, max(class_counts.values) + 16)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "class_distribution.png"), bbox_inches='tight')
    plt.savefig(os.path.join(OUTPUT_DIR, "Class Distribution.png"), bbox_inches='tight')
    plt.close()

    # Train primary model: Random Forest
    print("Training Random Forest model...", flush=True)
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=1)
    rf_model.fit(X_train, y_train)
    y_pred = rf_model.predict(X_test)
    y_proba = rf_model.predict_proba(X_test)
    overall_acc = accuracy_score(y_test, y_pred) * 100

    # 2. CONFUSION MATRIX
    print("2/6 Generating Confusion Matrix plot...", flush=True)
    cm = confusion_matrix(y_test, y_pred, labels=classes)
    plt.figure(figsize=(13, 11), dpi=300)
    short_labels = [c if len(c) < 18 else c[:15] + '..' for c in classes]
    sns.heatmap(
        cm, 
        annot=True, 
        fmt='d', 
        cmap='Blues', 
        xticklabels=short_labels, 
        yticklabels=short_labels,
        cbar=True,
        linewidths=0.5,
        linecolor='#cbd5e1'
    )
    plt.title(f"Multi-Class Confusion Matrix - Random Forest Classifier\nOverall Accuracy: {overall_acc:.1f}% on Test Partition", fontsize=15, fontweight='bold', pad=15, color='#0f172a')
    plt.xlabel("Predicted Structural Category", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.ylabel("True Structural Category", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.xticks(rotation=45, ha='right', fontsize=9.5)
    plt.yticks(rotation=0, fontsize=9.5)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "confusion_matrix.png"), bbox_inches='tight')
    plt.savefig(os.path.join(OUTPUT_DIR, "Confusion Matrix.png"), bbox_inches='tight')
    plt.close()

    # 3. CONFIDENCE DISTRIBUTION
    print("3/6 Generating Confidence Distribution plot...", flush=True)
    max_probas = np.max(y_proba, axis=1) * 100
    mean_conf = np.mean(max_probas)
    median_conf = np.median(max_probas)

    plt.figure(figsize=(10, 6), dpi=300)
    n, bins, patches = plt.hist(max_probas, bins=25, color='#2563eb', edgecolor='#1d4ed8', alpha=0.75, density=False)
    sns.kdeplot(max_probas, color='#0f172a', linewidth=2.5, ax=plt.gca().twinx())
    plt.gca().get_yaxis().set_visible(False)

    plt.axvline(mean_conf, color='#dc2626', linestyle='--', linewidth=2, label=f'Mean Confidence: {mean_conf:.1f}%')
    plt.axvline(median_conf, color='#16a34a', linestyle='-.', linewidth=2, label=f'Median Confidence: {median_conf:.1f}%')

    plt.title("Prediction Confidence Score Distribution across Material Predictions", fontsize=15, fontweight='bold', pad=15, color='#0f172a')
    plt.xlabel("Model Top-1 Output Confidence (%)", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.ylabel("Frequency (Number of Materials)", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend(frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', loc='upper left', fontsize=11)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "confidence_distribution.png"), bbox_inches='tight')
    plt.savefig(os.path.join(OUTPUT_DIR, "Confidence Distribution.png"), bbox_inches='tight')
    plt.close()

    # 4. LEARNING CURVES
    print("4/6 Generating Learning Curves plot...", flush=True)
    cv = StratifiedKFold(n_splits=4, shuffle=True, random_state=42)
    train_sizes, train_scores, test_scores = learning_curve(
        rf_model, X_scaled, y, cv=cv, n_jobs=1,
        train_sizes=np.linspace(0.15, 1.0, 6),
        scoring='accuracy',
        random_state=42
    )

    train_mean = np.mean(train_scores, axis=1) * 100
    train_std = np.std(train_scores, axis=1) * 100
    test_mean = np.mean(test_scores, axis=1) * 100
    test_std = np.std(test_scores, axis=1) * 100

    plt.figure(figsize=(10, 6.5), dpi=300)
    plt.plot(train_sizes, train_mean, 'o-', color='#1e40af', linewidth=2.5, markersize=6, label='Training Score')
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.15, color='#1e40af')

    plt.plot(train_sizes, test_mean, 's-', color='#16a34a', linewidth=2.5, markersize=6, label='Cross-Validation Score')
    plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, alpha=0.15, color='#16a34a')

    plt.title("Model Learning Curves (Random Forest Classifier)\nConvergence & Generalization Analysis", fontsize=15, fontweight='bold', pad=15, color='#0f172a')
    plt.xlabel("Training Set Size (Instances)", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.ylabel("Accuracy Score (%)", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.ylim(65, 102)
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend(frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', loc='lower right', fontsize=11)

    plt.annotate(f'Final CV: {test_mean[-1]:.1f}% ± {test_std[-1]:.1f}%', 
                 xy=(train_sizes[-1], test_mean[-1]), 
                 xytext=(train_sizes[-1] - 180, test_mean[-1] - 6),
                 arrowprops=dict(facecolor='#0f172a', arrowstyle='->', lw=1.5),
                 fontweight='bold', fontsize=10, color='#0f172a')

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "learning_curves.png"), bbox_inches='tight')
    plt.savefig(os.path.join(OUTPUT_DIR, "Learning Curves.png"), bbox_inches='tight')
    plt.close()

    # 5. MODEL COMPARISON
    print("5/6 Generating Model Comparison plot...", flush=True)
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=80, random_state=42, n_jobs=1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=80, random_state=42),
        'SVM (RBF Kernel)': SVC(probability=True, random_state=42),
        'Neural Net (MLP)': MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=300, random_state=42),
        'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5, n_jobs=1)
    }

    comparison_data = []
    for name, m in models.items():
        print(f"  Training {name}...", flush=True)
        m.fit(X_train, y_train)
        preds = m.predict(X_test)
        acc = accuracy_score(y_test, preds) * 100
        prec = precision_score(y_test, preds, average='weighted', zero_division=0) * 100
        rec = recall_score(y_test, preds, average='weighted', zero_division=0) * 100
        f1 = f1_score(y_test, preds, average='weighted', zero_division=0) * 100
        comparison_data.append({
            'Model': name,
            'Accuracy': acc,
            'Precision': prec,
            'Recall': rec,
            'F1-Score': f1
        })

    comp_df = pd.DataFrame(comparison_data)

    plt.figure(figsize=(12, 6.5), dpi=300)
    x_indices = np.arange(len(comp_df))
    width = 0.18

    metrics_to_plot = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
    palette = ['#1d4ed8', '#0284c7', '#0d9488', '#16a34a']

    for i, metric in enumerate(metrics_to_plot):
        offset = (i - 1.5) * width
        bars = plt.bar(x_indices + offset, comp_df[metric], width=width, label=metric, color=palette[i], edgecolor='#ffffff', linewidth=0.8)
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2, height + 1.0, f'{height:.1f}%',
                     ha='center', va='bottom', fontsize=8, fontweight='bold', rotation=90)

    plt.title("Comparative Performance Analysis of Structural Decision Models", fontsize=15, fontweight='bold', pad=15, color='#0f172a')
    plt.xlabel("Evaluated Machine Learning Architecture", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.ylabel("Benchmarking Score (%)", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.xticks(x_indices, comp_df['Model'], fontweight='bold', fontsize=10.5)
    plt.ylim(60, 108)
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.legend(frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', loc='upper right', ncol=4, fontsize=10)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "model_comparison.png"), bbox_inches='tight')
    plt.savefig(os.path.join(OUTPUT_DIR, "Model Comparison.png"), bbox_inches='tight')
    plt.close()

    # 6. ROC CURVE
    print("6/6 Generating ROC Curve plot...", flush=True)
    y_train_bin = label_binarize(y_train, classes=classes)
    y_test_bin = label_binarize(y_test, classes=classes)

    fpr = dict()
    tpr = dict()
    roc_auc = dict()

    for i in range(n_classes):
        fpr[i], tpr[i], _ = roc_curve(y_test_bin[:, i], y_proba[:, i])
        roc_auc[i] = auc(fpr[i], tpr[i])

    fpr["micro"], tpr["micro"], _ = roc_curve(y_test_bin.ravel(), y_proba.ravel())
    roc_auc["micro"] = auc(fpr["micro"], tpr["micro"])

    plt.figure(figsize=(10, 7.5), dpi=300)
    plt.plot(
        fpr["micro"], tpr["micro"],
        label=f'Micro-Average ROC Curve (AUC = {roc_auc["micro"]:.3f})',
        color='#dc2626', linestyle=':', linewidth=3.5
    )

    rep_indices = [0, 2, 4, 6, 8, 10]
    sample_palette = sns.color_palette("tab10", len(rep_indices))

    for idx, color in zip(rep_indices, sample_palette):
        c_name = classes[idx]
        plt.plot(
            fpr[idx], tpr[idx],
            color=color, linewidth=2,
            label=f'{c_name[:20]} (AUC = {roc_auc[idx]:.3f})'
        )

    plt.plot([0, 1], [0, 1], 'k--', linewidth=1.5, alpha=0.7, label='Random Chance Baseline (AUC = 0.50)')

    plt.xlim([-0.02, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.ylabel("True Positive Rate (Sensitivity / Recall)", fontsize=12, fontweight='bold', labelpad=10, color='#1e293b')
    plt.title("Multi-Class One-vs-Rest Receiver Operating Characteristic (ROC)", fontsize=15, fontweight='bold', pad=15, color='#0f172a')
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.legend(loc="lower right", frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=9.5)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, "roc_curve.png"), bbox_inches='tight')
    plt.savefig(os.path.join(OUTPUT_DIR, "ROC Curve.png"), bbox_inches='tight')
    plt.close()

    print("\nSUCCESS! All 6 performance charts created in Output/Performance/:\n", flush=True)
    for f in sorted(os.listdir(OUTPUT_DIR)):
        size_kb = os.path.getsize(os.path.join(OUTPUT_DIR, f)) / 1024
        print(f" - {f} ({size_kb:.1f} KB)", flush=True)

if __name__ == '__main__':
    main()
