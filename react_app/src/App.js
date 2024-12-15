//pullした後に必要な処理
// 1. cd <pill先のフォルダのパス>/agquiz/react_app
// 2. npm update react
// 3. npm start

import { useState } from "react";
import './App.css';
import { quizData } from "./quizData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Button from 'react-bootstrap/Button'; 

function App() {
  // Stateの定義
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isScoreVisible, setIsScoreVisible] = useState(false);

  // 初期化関数
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setIsNextEnabled(false);
    setAnswers([]);
    setScore(0);
    setFeedback(null);
    setIsScoreVisible(false);
  };

  // PDFダウンロード関数
  const downloadPDF = () => {
    const element = document.getElementById("pdf-content");
    if (!element) return console.error("Element not found");

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("download.pdf");
    });
  };

  // 次の質問へ移動
  const goToNextQuestion = () => {
    const nextIndex = currentQuestion + 1;
    if (nextIndex < quizData.length) {
      setCurrentQuestion(nextIndex);
    } else {
      setIsScoreVisible(true);
    }
    setIsNextEnabled(false);
    setFeedback(null);
  };

  // 答えの処理
  const handleAnswer = (selectedAnswer) => {
    const currentQuiz = quizData[currentQuestion];
    const isCorrect = currentQuiz.correct === selectedAnswer;

    setAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        question: currentQuiz.question,
        answer: selectedAnswer,
        correctAnswer: currentQuiz.correct,
        isCorrect,
      },
    ]);

    setScore((prevScore) => (isCorrect ? prevScore + 1 : prevScore));
    setFeedback(isCorrect ? "正解です" : "不正解です");
    setIsNextEnabled(true);
  };

  // スコア画面
  const renderScoreSection = () => (
    <div className="score-section">
      <div id="pdf-content">
        <h1>スコア</h1>
        <h2>{score} / {quizData.length}</h2>
        <table className="answer-table">
          <thead>
            <tr>
              <th>質問</th>
              <th>あなたの解答</th>
              <th>正解</th>
              <th>合否</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((item, index) => (
              <tr key={index} className={item.isCorrect ? 'correct' : 'wrong'}>
                <td>{item.question}</td>
                <td>{item.answer}</td>
                <td>{item.correctAnswer}</td>
                <td>{item.isCorrect ? 'OK' : 'NG'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="primary" className="my-primary-button" onClick={resetQuiz}>最初から</Button>
      <Button variant="primary" className="my-primary-button" onClick={downloadPDF}>レポート作成</Button>
    </div>
  );

  // クイズ画面
  const renderQuizSection = () => {
    const currentQuiz = quizData[currentQuestion];

    return (
      <div className='question-section'>
        <h1>問題 {currentQuestion + 1} / {quizData.length}</h1>
        <h2>{currentQuiz.question}</h2>
        {isNextEnabled ? (
          <div className="feedback-section">
            <h2 className="large-feedback">{feedback}</h2>
            <p>正解: {currentQuiz.correct}</p>
            <Button onClick={goToNextQuestion}>次の問題へ</Button>
          </div>
        ) : (
          <div className="answer-section">
            {currentQuiz.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                className="quiz-option-button"
                size="lg"
              >
                {option}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='quiz-container'>
      {isScoreVisible ? renderScoreSection() : renderQuizSection()}
    </div>
  );
}

export default App;
