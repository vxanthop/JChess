let pgn = {
  Event: "",
  Site: "",
  Date: "",
  Round: "",
  White: "",
  Black: "",
  Result: "*",
  Moves: "",
};

function resetPgn() {
  pgn = {
    Event: "",
    Site: "",
    Date: "",
    Round: "",
    White: "",
    Black: "",
    Result: "*",
    Moves: "",
  };
}

function exportPgn(data) {
  let file = new Blob([data], { type: "text/plain" });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, "game.pgn");
  else {
    // Others
    let a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = "game.pgn";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

function makePgnFile() {
  data = "";
  for (var key in pgn) {
    if (key == "Moves") {
      data += "\n";
      data += pgn[key];
    } else {
      data += "[" + key + ' "' + pgn[key] + '"]\n';
    }
  }

  exportPgn(data);
}

function addToPgn(move, moveNumber) {
  if (!superMode) {
    moveString = moveBuilder(move);

    if (turn == "white") {
      pgn.Moves += moveNumber + ". ";
    }

    pgn.Moves += moveString + " ";

    if (move.isCheckMate) {
      if (turn == "white") {
        pgn.Result = "1-0";
        pgn.Moves += "1-0";
      } else {
        pgn.Result = "0-1";
        pgn.Moves += "0-1";
      }
    }

    if (move.isStaleMate || move.drawRule) {
      pgn.Result = "1/2-1/2";
      pgn.Moves += "1/2-1/2";
    }
  }
}
