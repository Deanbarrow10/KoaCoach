// ExploreQuizScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

// switches wellness trivia to fitness fundamentals quiz
const quizData = [
  {
    question:
      "How much protein per meal best supports muscle protein synthesis for most adults?",
    options: ["10 g", "20–40 g", "60 g", "80 g"],
    correctAnswerIndex: 1,
    funFact:
      "aim for about 20–40 grams of protein in a meal to maximize muscle growth — roughly a palm-sized portion of chicken, fish, or tofu for most adults",
  },
  {
    question: "What’s the main purpose of a warm-up before exercise?",
    options: [
      "Burn extra calories",
      "Prevent muscle soreness",
      "Increase blood flow and prepare the body for activity",
      "Make workouts longer",
    ],
    correctAnswerIndex: 2,
    funFact:
      "a proper warm-up raises muscle temperature, improves joint mobility, and primes the nervous system for better performance and reduced injury risk.",
  },
  {
    question:
      "Which rep range is commonly used for muscle hypertrophy (building size)?",
    options: ["1–3 reps", "6–12 reps", "15–25 reps", "30–50 reps"],
    correctAnswerIndex: 1,
    funFact:
      "6–12 reps works well when sets end close to failure; total volume and consistency matter most.",
  },
  {
    question:
      "How long should you typically rest between heavy strength sets (squat, deadlift) for best performance?",
    options: ["10–30 seconds", "30–60 seconds", "2–5 minutes", "8–10 minutes"],
    correctAnswerIndex: 2,
    funFact:
      "2–5 minutes restores more phosphocreatine so you can lift heavier and maintain quality across sets.",
  },
  {
    question: "Which of the following is a complete protein source?",
    options: ["Rice", "Beans", "Eggs", "Peanuts"],
    correctAnswerIndex: 2,
    funFact:
      "complete proteins have all 9 essential amino acids—eggs, dairy, fish, and soy qualify; rice + beans together also complement each other.",
  },
  {
    question:
      "When does delayed onset muscle soreness (DOMS) usually peak after a tough workout?",
    options: [
      "Immediately after",
      "At 12 hours only",
      "24–72 hours later",
      "One week later",
    ],
    correctAnswerIndex: 2,
    funFact:
      "eccentric movements (like lowering a squat) tend to cause more DOMS—soreness isn’t required for progress.",
  },
  {
    question:
      "About how many daily steps are linked with lower all-cause mortality in adults?",
    options: ["3,000", "5,000", "7,000–8,000", "15,000"],
    correctAnswerIndex: 2,
    funFact:
      "7–8k steps shows strong benefits for many people—add some brisk pace to boost cardio health further.",
  },
  {
    question:
      "How much sleep do most active adults need for recovery and performance?",
    options: ["4–5 hours", "6 hours exactly", "7–9 hours", "10–12 hours"],
    correctAnswerIndex: 2,
    funFact:
      "sleep drives hormone regulation, tissue repair, and learning of motor skills—protect it like a workout.",
  },
  {
    question:
      "What’s the primary fuel for high-intensity exercise (sprints, heavy sets)?",
    options: ["Fat", "Carbohydrates", "Protein", "Vitamins"],
    correctAnswerIndex: 1,
    funFact:
      "carbs power fast efforts via glycogen—pair protein with carbs post-workout to recover and rebuild.",
  },
  {
    question:
      "What’s the most reliable way to keep getting stronger over time?",
    options: [
      "Random new workouts daily",
      "Always train to failure",
      "Copy influencers exactly",
      "Progressive overload (increase load, reps, or sets gradually)",
    ],
    correctAnswerIndex: 3,
    funFact:
      "small, steady increases plus deload weeks prevent plateaus and reduce injury risk—consistency wins.",
  },
];

const ExploreQuizScreen = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const current = quizData[questionIndex];

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    setQuestionIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  if (questionIndex >= quizData.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.endTitle}>🎉 You finished the quiz!</Text>
        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
          <Text style={styles.restartText}>🔄 Restart Quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Fitness Fun Facts 🍎</Text>
        <Text style={styles.question}>{current.question}</Text>
        {current.options.map((option, index) => {
          const isCorrect = index === current.correctAnswerIndex;
          const isSelected = index === selectedAnswer;
          const isWrong = isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                isCorrect && showAnswer
                  ? styles.correct
                  : isWrong
                  ? styles.wrong
                  : null,
              ]}
              onPress={() => handleAnswer(index)}
              disabled={showAnswer}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
        {showAnswer && (
          <View style={styles.feedbackBox}>
            <Text style={styles.funFactTitle}>💡 Fun Fact</Text>
            <Text style={styles.funFact}>{current.funFact}</Text>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>Next Question →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  scroll: {
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    marginLeft: 10,
    marginRight: 10,
  },
  question: {
    fontSize: 18,
    marginBottom: 12,
    color: "#444",
    marginLeft: 10,
    marginRight: 10,
  },
  option: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  correct: {
    backgroundColor: "#DFFFE2",
    borderColor: "#2ECC71",
  },
  wrong: {
    backgroundColor: "#FFE2E2",
    borderColor: "#E74C3C",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  feedbackBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#FFFBEA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1C40F",
  },
  funFactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#B7950B",
  },
  funFact: {
    fontSize: 14,
    color: "#555",
  },
  nextButton: {
    marginTop: 16,
    alignSelf: "flex-end",
  },
  nextText: {
    fontSize: 16,
    color: "#196315",
    fontWeight: "bold",
  },
  endTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 100,
    color: "#196315",
  },
  endSubtitle: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 12,
    color: "#444",
  },
  restartButton: {
    marginTop: 30,
    alignSelf: "center",
    backgroundColor: "#196315",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  restartText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ExploreQuizScreen;
