import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";
import { quizData } from "./quizData";

// Mock html2canvas and jsPDF
jest.mock("html2canvas", () => jest.fn(() => Promise.resolve({
  toDataURL: jest.fn(() => "mockImageData"),
})));
jest.mock("jspdf", () => jest.fn(() => ({
  addImage: jest.fn(),
  save: jest.fn(),
  internal: {
    pageSize: { getWidth: jest.fn(() => 210), getHeight: jest.fn(() => 297) },
  },
})));

describe("App Component", () => {
  test("renders the first question correctly", () => {
    render(<App />);
    expect(screen.getByText(`問題 1 / ${quizData.length}`)).toBeInTheDocument();
    expect(screen.getByText(quizData[0].question)).toBeInTheDocument();
    quizData[0].options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  test("selecting a correct answer updates the feedback and score", () => {
    render(<App />);
    fireEvent.click(screen.getByText(quizData[0].correct)); // Correct answer
    expect(screen.getByText("正解です")).toBeInTheDocument();
    expect(screen.getByText("解答")).toBeInTheDocument();
    expect(screen.getByText(quizData[0].correct)).toBeInTheDocument();
  });

  test("selecting an incorrect answer shows feedback", () => {
    render(<App />);
    const incorrectAnswer = quizData[0].options.find(
      (option) => option !== quizData[0].correct
    );
    fireEvent.click(screen.getByText(incorrectAnswer)); // Incorrect answer
    expect(screen.getByText("不正解です")).toBeInTheDocument();
    expect(screen.getByText("解答")).toBeInTheDocument();
    expect(screen.getByText(quizData[0].correct)).toBeInTheDocument();
  });

  test("navigates to the next question", () => {
    render(<App />);
    fireEvent.click(screen.getByText(quizData[0].correct)); // Answer first question
    fireEvent.click(screen.getByText("次の問題へ"));
    expect(screen.getByText(`問題 2 / ${quizData.length}`)).toBeInTheDocument();
    expect(screen.getByText(quizData[1].question)).toBeInTheDocument();
  });

  test("displays the score at the end of the quiz", () => {
    render(<App />);
    quizData.forEach((question) => {
      fireEvent.click(screen.getByText(question.correct)); // Answer all questions correctly
      fireEvent.click(screen.getByText("次の問題へ"));
    });
    expect(screen.getByText(/スコア/i)).toBeInTheDocument();
    expect(screen.getByText(`${quizData.length}/${quizData.length}`)).toBeInTheDocument();
  });

  // test("PDF is generated when レポート作成 button is clicked", async () => {
  //   render(<App />);
  //   quizData.forEach((question) => {
  //     fireEvent.click(screen.getByText(question.correct)); // Answer all questions
  //     fireEvent.click(screen.getByText("次の問題へ"));
  //   });
  //   fireEvent.click(screen.getByText("レポート作成"));

  //   // Ensure pdf functions are called
  //   const jsPDF = require("jspdf");
  //   const mockPDF = jsPDF.mock.instances[0];
  //   expect(mockPDF.addImage).toHaveBeenCalled();
  //   expect(mockPDF.save).toHaveBeenCalledWith("download.pdf");
  // });

  test("restarts the quiz when 最初から is clicked", () => {
    render(<App />);
    quizData.forEach((question) => {
      fireEvent.click(screen.getByText(question.correct)); // Answer all questions
      fireEvent.click(screen.getByText("次の問題へ"));
    });
    fireEvent.click(screen.getByText("最初から"));
    expect(screen.getByText(`問題 1 / ${quizData.length}`)).toBeInTheDocument();
    expect(screen.getByText(quizData[0].question)).toBeInTheDocument();
    expect(screen.queryByText(/スコア/i)).not.toBeInTheDocument();
  });
});
