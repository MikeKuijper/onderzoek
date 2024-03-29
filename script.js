let questions;
let sent = false;

function getQuestions() {
  fetch('./questions.json').then(response =>
    response.json().then(data => ({
      data: data,
      status: response.status
    })).then(res => {

      questions = res.data;
      // console.log(questions);
      let sum = 0;
      let offset = 0;
      for (let k in questions.sections) {
        let section = questions.sections[k];
        formatHeading(section.name);
        for (let i in section.questions) {
          // console.log(section.questions[i]);
          if (section.questions[i].type == "paragraph") offset--;
          formatQuestion(section.questions[i], sum + offset);
          sum++;
        }
      }
    }));
}

function formatQuestion(obj, i) {
  let form = document.createElement("form");

  let title = document.createElement("h2");
  let aft = (obj.required) ? "*" : "";
  title.innerHTML = obj.question + aft;
  title.setAttribute('class', 'questionTitle');

  i++;

  if (obj.type != "paragraph") {
    let number = document.createElement("h2");
    number.innerHTML = i;
    number.setAttribute('class', 'number');
    form.appendChild(number);
  }
  console.log(i);

  form.appendChild(title);

  switch (obj.type) {
    case "multipleChoice": // let column = document.createElement('div');
      // column.setAttribute('class', 'column');
      let row;
      let column;
      row = document.createElement('div');
      row.setAttribute('class', 'row');
      let count = 0
      for (let j in obj.answers) {
        count++;
        column = document.createElement('div');
        column.setAttribute('class', 'column');
        let input = document.createElement('input');
        input.setAttribute('type', 'radio');
        input.setAttribute('id', `${i-1}-${j}`);
        input.setAttribute('name', 'selector');
        let label = document.createElement('label');
        label.setAttribute('for', `${i-1}-${j}`);
        label.setAttribute("style", `padding-left: 5vw`);
        label.innerHTML = obj.answers[j];
        if (obj.answers[j].length > 8) label.setAttribute('style', "font-size: 1.1em; padding-left: 5vw");
        column.appendChild(input);
        column.appendChild(label);
        row.appendChild(column);
        if (count == 2 || j == obj.answers.length - 1) {
          form.appendChild(row);
          row = document.createElement('div');
          row.setAttribute('class', 'row');
          count = 0;
        }
      }
      let brk = document.createElement('br');
      form.appendChild(brk);
      break;
    case "number":
      let row2 = document.createElement('div');
      row2.setAttribute('class', 'row');
      let input = document.createElement('input');
      input.setAttribute('class', 'numberInput');
      input.setAttribute('type', 'number');
      input.setAttribute('id', `${i-1}`);
      row2.appendChild(input);
      form.appendChild(row2);
      let brk2 = document.createElement('br');
      form.appendChild(brk2);
      break;
    case "text":
      let row3 = document.createElement('div');
      row3.setAttribute('class', 'row');
      let input2 = document.createElement('input');
      input2.setAttribute('class', 'textInput');
      input2.setAttribute('type', 'text');
      input2.setAttribute('id', `${i-1}`);
      row3.appendChild(input2);
      form.appendChild(row3);
      let brk3 = document.createElement('br');
      form.appendChild(brk3);
      break;
    case "paragraph":
      let row4 = document.createElement('div');
      let text = document.createElement('h');
      // text.setAttribute('class', 'textInput');
      text.innerHTML = obj.text;
      row4.appendChild(text);
      row4.setAttribute('class', 'row');
      form.appendChild(row4);
      let brk4 = document.createElement('br');
      form.appendChild(brk4);
      break;
  }

  document.getElementById("content").appendChild(form);
}

function formatHeading(text) {
  let brk = document.createElement('br');
  let title = document.createElement("h2");
  title.innerHTML = text;
  title.setAttribute('class', 'title');
  title.setAttribute('style', 'color: #ffffff; font-size: 4rem;');
  document.getElementById("content").appendChild(brk);
  document.getElementById("content").appendChild(title);
}

function send() {
  let err = false;
  let obj = {
    required: [],
    answers: [],
    survey: ""
  };
  obj.survey = questions.survey;
  let sum = 0;
  let offset = 0;
  for (let i in questions.sections) {
    for (let j in questions.sections[i].questions) {
      let q = questions.sections[i].questions[j];
      if (q.type == 'paragraph') offset--;
      if (q.type == 'multipleChoice') {
        for (let k in q.answers) {
          if (document.getElementById(`${sum + offset}-${k}`).checked) {
            obj.answers.push(parseInt(k));
            break;
          }
          if (k == q.answers.length - 1 && !document.getElementById(`${sum + offset}-${k}`).checked) obj.answers.push(null);
        }
      }
      if (q.type == 'number') {
        obj.answers.push(document.getElementById(`${sum + offset}`).value);
      }
      if (q.type == 'text') {
        obj.answers.push(document.getElementById(`${sum + offset}`).value);
      }
      if (q.type != 'paragraph') obj.required.push(q.required);
      sum++;
    }
  }

  for (let a in obj.required) {
    if (obj.required[a] == true) {
      if (obj.answers[a] == null || obj.answers[a].length == 0) {
        showError(`Vraag ${parseInt(a) + 1} is verplicht.`);
        err = true;
        break;
      }
    }
  }

  let time = new Date();
  let formatted_date = time.getFullYear() + "-" + addZeroes(time.getMonth() + 1) + "-" + addZeroes(time.getDate()) + " " + addZeroes(time.getHours()) + ":" + addZeroes(time.getMinutes()) + ":" + addZeroes(time.getSeconds());
  console.log(formatted_date)

  if (!err && !sent) {
    sent = true;
    fetch('https://cors-anywhere.herokuapp.com/http://onderzoek.mikelodeon.nl:8080/', {
        method: 'post',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          "answers": obj.answers,
          "survey": obj.survey,
          "time": formatted_date
        })
      }).then(res => res.json())
      .then((res) => {
        console.log(res);
        if (res.success == true) {
          showThanks();
        } else if (res.success == false) {
          showBig("Oeps", "Dit antwoord wordt niet door de server geaccepteerd");
        }
      });
  }
}

function showThanks() {
  window.scrollTo(0, 0);
  document.getElementById("everything").style.visibility = "hidden";
  document.getElementById("everything").style.maxHeight = "100vh";
  document.getElementById("everything").style.overflow = "hidden";
  document.getElementById("thanks").style.visibility = "visible";
}

function showBig(title, subtitle) {
  window.scrollTo(0, 0);
  document.getElementById("everything").style.visibility = "hidden";
  document.getElementById("everything").style.maxHeight = "100vh";
  document.getElementById("everything").style.overflow = "hidden";
  document.getElementById("thanks").style.visibility = "visible";
  document.getElementById("messageTitle").innerHTML = title;
  document.getElementById("messageSubTitle").innerHTML = subtitle;
}

function showError(err) {
  document.getElementById("error").style.display = "block";
  document.getElementById("errorText").innerHTML = err;
}

function addZeroes(n) {
  if (n <= 9) {
    return "0" + n;
  }
  return n
}
