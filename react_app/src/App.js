import { useState } from "react";
import './App.css';
import { quizData } from "./quizData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Bootstrapのスタイルとコンポーネントのインポート
import 'bootstrap/dist/css/bootstrap.min.css'; 
import Button from 'react-bootstrap/Button'; 

function App() {
  // Stateの定義。コンポーネント内で状態管理を行う。
  const [currentQuestion, setCurrentQuestion] = useState(0); // 現在の質問インデックス
  const [next, setNext] = useState(false); // 次の問題への遷移可能フラグ
  const [answer, setAnswer] = useState([]); // 解答の履歴
  const [score, setScore] = useState(0); // 現在のスコア
  const [feedback, setFeedback] = useState(null); // 解答結果のフィードバック
  const [showScore, setShowScore] = useState(false); // スコア画面の表示フラグ

  // クイズを最初からやり直すためのリセット関数
  const goToFirstQuestion = () => {
    setCurrentQuestion(0);
    setNext(false);
    setAnswer([]);
    setScore(0);
    setFeedback(null);
    setShowScore(false);
  };

  // 解答レポートをPDFとしてダウンロードする関数
  function downloadPDF() {
    const element = document.getElementById("pdf-content"); // PDF化対象の要素を取得
    if (!element) {
      console.error("Element not found"); // 要素が存在しない場合はエラーを表示
      return;
    }

    // html2canvasで要素を画像化し、jsPDFでPDFを生成
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png"); 
      const pdf = new jsPDF("p", "mm", "a4"); 
      const pdfWidth = pdf.internal.pageSize.getWidth(); 
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; 
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight); 
      pdf.save("quizResult.pdf"); // ファイル名を指定してダウンロード
    });
  }

  // 次の質問に移動する関数
  const goToNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizData.length) {
      setCurrentQuestion(nextQuestion); // 次の質問へ遷移
    } else {
      setShowScore(true); // 質問が終了したらスコア画面を表示
    }
    setNext(false);
    setFeedback(null);
  };

  // 解答を処理する関数
  const handleAnswer = (answer) => {
    const newAnswer = {
      question: quizData[currentQuestion].question, // 現在の質問文
      answer: answer, // ユーザーの解答
      rightanswer: quizData[currentQuestion].correct, // 正解
      correct: quizData[currentQuestion].correct === answer, // 正解かどうかの判定
    };

    // 正解の場合スコアを更新し、フィードバックを設定
    if (newAnswer.correct) {
      setScore((prevScore) => prevScore + 1);
      setFeedback("正解です");
    } else {
      setFeedback("不正解です");
    }

    // 解答履歴を更新
    setAnswer((prevAnswer) => [...prevAnswer, newAnswer]);
    setNext(true); // 次の質問へのフラグを立てる
  };

  return (
    <div className='quiz-container'>
      {showScore ? (
        // スコア画面
        <div className="score-section">
          <scope id="pdf-content"> {/* PDF化対象の範囲 */}
            <h1>スコア</h1>
            <h2>{score}/{quizData.length}</h2>
            <table className="answer-table">
              <thead>
                <tr>
                  <td>質問</td>
                  <td>あなたの解答</td>
                  <td>正解</td>
                  <td>合否</td>
                </tr>
              </thead>
              <tbody>
                {answer.map((item) => (
                  <tr className={item.correct ? 'correct' : 'wrong'}>
                    <td>{item.question}</td>
                    <td>{item.answer}</td>
                    <td>{item.rightanswer}</td>
                    <td>{item.correct ? 'OK' : 'NG'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </scope>
          <Button variant="primary" className="my-primary-button" onClick={goToFirstQuestion}>
            最初から
          </Button>
          <Button variant="primary" className="my-primary-button" onClick={downloadPDF}>
            レポート作成
          </Button>
        </div>
      ) : (
        // クイズ画面
        <div className='question-section'>
          <h1>問題 {currentQuestion + 1} / {quizData.length}</h1>
          <h2>{quizData[currentQuestion].question}</h2>
          {next ? (
            // 解答のフィードバック画面
            <div className="feedback-section">
              <h2 className="large-feedback">{feedback}</h2>
              <p>解答</p>
              <p className="answer-data">{quizData[currentQuestion].correct}</p>
              <Button onClick={goToNextQuestion}>次の問題へ</Button>
            </div>
          ) : (
            // 質問に答える画面
            <div className="answer-section">
              {quizData[currentQuestion].options.map((item) => (
                <Button
                  key={item}
                  onClick={() => handleAnswer(item)}
                  className="quiz-option-button"
                  size="lg"
                >
                  {item}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
