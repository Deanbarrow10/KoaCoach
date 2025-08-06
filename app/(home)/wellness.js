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

const quizData = [
  {
    question:
      'What brain chemical is known as the "happiness neurotransmitter"?',
    options: ["Adrenaline", "Serotonin", "Caffeine", "Melatonin"],
    correctAnswerIndex: 1,
    funFact:
      "Serotonin helps regulate mood, sleep, and appetite. Low levels are linked to depression - that's why sunlight and exercise boost your mood!",
  },
  {
    question:
      "How long can your brain hold information in short-term memory without rehearsal?",
    options: ["2 minutes", "15-30 seconds", "5 minutes", "1 hour"],
    correctAnswerIndex: 1,
    funFact:
      "This is why you forget someone's name immediately after meeting them! Your brain needs repetition or emotional connection to move memories to long-term storage.",
  },
  {
    question:
      "Which color is scientifically proven to reduce stress and anxiety?",
    options: ["Red", "Yellow", "Green", "Purple"],
    correctAnswerIndex: 2,
    funFact:
      "Green reduces eye strain and has a calming effect because it's the color our eyes process most easily. This is why hospitals often use green!",
  },
  {
    question:
      "What percentage of your dreams do you typically forget by morning?",
    options: ["25%", "50%", "75%", "95%"],
    correctAnswerIndex: 3,
    funFact:
      "Dreams help process emotions and memories, but we forget most of them because the brain chemicals needed for memory formation are turned off during REM sleep!",
  },
  {
    question: "How long does it take to form a first impression of someone?",
    options: ["30 seconds", "5 minutes", "100 milliseconds", "2 minutes"],
    correctAnswerIndex: 2,
    funFact:
      "Your brain makes snap judgments in less than a tenth of a second! This helped our ancestors quickly identify friend or foe, but can create unconscious bias today.",
  },
  {
    question:
      "What's the name for your body's automatic 'fight or flight' response?",
    options: [
      "Sympathetic nervous system",
      "Digestive system",
      "Immune system",
      "Circulatory system",
    ],
    correctAnswerIndex: 0,
    funFact:
      "This system evolved to help you escape predators, but now it activates for work emails and traffic jams! Learning to calm it is key to managing modern stress.",
  },
  {
    question: "How many basic human emotions do psychologists agree on?",
    options: ["3", "6", "10", "27"],
    correctAnswerIndex: 1,
    funFact:
      "The six basic emotions are happiness, sadness, anger, fear, surprise, and disgust. All other emotions are combinations or variations of these!",
  },
  {
    question: "What's the most effective way to remember new information?",
    options: [
      "Reading it over and over",
      "Highlighting important parts",
      "Teaching it to someone else",
      "Writing it down once",
    ],
    correctAnswerIndex: 2,
    funFact:
      "The 'teaching effect' forces your brain to organize and simplify information, creating stronger neural pathways. That's why study groups work so well!",
  },
  {
    question:
      "Your brain uses approximately what percentage of your body's total energy?",
    options: ["5%", "20%", "35%", "50%"],
    correctAnswerIndex: 1,
    funFact:
      "Despite being only 2% of your body weight, your brain uses 20% of your energy! This is why good nutrition and sleep are so important for mental clarity and mood.",
  },
  {
    question:
      "Practicing gratitude for just 2 weeks can increase happiness by how much?",
    options: ["5%", "25%", "50%", "75%"],
    correctAnswerIndex: 1,
    funFact:
      "Gratitude literally rewires your brain! It increases activity in the hypothalamus (stress regulation) and dopamine production (pleasure and motivation).",
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
        <Text style={styles.title}>Psychology Fun Facts 🎉</Text>
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
