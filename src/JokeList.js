import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";
import Joke from "./Joke";
import uuid from "uuid/v4";

// css emojiCSS
export class JokeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(localStorage.getItem("jokes")) || [],
      maxJokes: 10,
      loading: false
    };
    // localstorage에 미리 있는경우 set에포함시킨다.
    // 이것은 내부적으로만 사용하는 변수이므로 state에포함시켜 render을일으키지 않는다.
    this.seenJoke = new Set(this.state.jokes.map(j => j.text));
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    // 맨처음 pageload될시에 작동 조크를 불러온다.
    // 그후에 페이지 리로드될때마다 localstorage에서 가져오기때문에 작동안함.
    if (this.state.jokes.length === 0) {
      this.setState(
        {
          loading: true
        },
        this.loadJokes
      );
    }
  }

  async loadJokes() {
    try {
      // 여기 api가 기본적으로 html을 반환하고 선택적으로 json형태를 원할떄 헤더에 추가정보를넣음된다.
      let jokes = [];

      // duplicate joke확인하려면 jokes안에 모든 joke.text을 읽어야되기때문에 오래걸려
      // set을 사용한다. set은 has("?")가 true/false리턴한다.
      //10개 호출할때까지 반복.
      while (jokes.length < this.state.maxJokes) {
        const res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" }
        });
        if (!this.seenJoke.has(res.data.joke)) {
          jokes.push({ id: uuid(), text: res.data.joke, votes: 0 });
          this.seenJoke.add(res.data.joke);
        } else {
          console.log("DUPLICTE");
          console.log(res.data.joke);
        }
      }
      // state를 바꾸고 localstorage에도 reload를대비해서 저장해둔다.
      this.setState(
        st => ({ jokes: [...st.jokes, ...jokes], loading: false }),
        () => localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (e) {
      alert(e);
      this.setState({
        loading: false
      });
    }
  }

  handleClick() {
    this.setState(
      {
        loading: true
      },
      this.loadJokes
    );
  }

  handleVote(id, delta) {
    // 아이디가 다르면 그대로 리턴하고 같다면 나머지는유지하고 vote속성만바꾼다
    // vote바뀌는것도 localstorage에 저장해야되기때문에
    // setState가 지나고 발동하는 콜백함수로 localstorage에저장한다.
    this.setState(
      st => ({
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
      }),
      () => localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  render() {
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt=""
          />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            New Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {this.state.loading ? (
            <div className="spinner">
              <i className="far fa-8x fa-laugh fa-spin" />
              <h1 className="Joke-title">Loading...</h1>
            </div>
          ) : (
            this.state.jokes.map(j => (
              <Joke
                key={j.id}
                votes={j.votes}
                text={j.text}
                upVote={() => this.handleVote(j.id, 1)}
                downVote={() => this.handleVote(j.id, -1)}
              />
            ))
          )}
        </div>
      </div>
    );
  }
}

export default JokeList;
