import './components/CarNameForm';
import './components/GameProgress';
import './components/GameResult';
import './components/TryAmountForm';
import Component from './core/Component';
import Car from './service/Car';
import { $ } from './utils/querySelector';

const getScore = (gameResult: number[]) => gameResult.reduce((cur, prev) => cur + prev);

const getWinners = (cars: Car[]) => {
  const scores = cars.map((car) => getScore(car.gameResult));
  const winnerScore = Math.max(...scores);

  return cars.filter((car) => getScore(car.gameResult) === winnerScore).map((car) => car.carName);
};

interface AppState {
  cars: Car[];
  tryAmount: number;
}

class App extends Component {
  template = /* html */ `
    <section class="d-flex justify-center mt-5">
      <div>
        <h1 class="text-center">🏎️ 자동차 경주 게임</h1>
        <my-name-form></my-name-form>
        <my-try-amount-form></my-try-amount-form>
      </div>
    </section>

    <section class="d-flex justify-center mt-5">
      <my-game-progress></my-game-progress>
    </section>

    <section class="d-flex justify-center mt-5">
      <my-game-result></my-game-result>
    </section>
  `;

  $nameForm?: Component;
  $tryAmountForm?: Component;
  $gameProgress?: Component;
  $gameResult?: Component;

  state: AppState = {
    cars: [],
    tryAmount: 0,
  };

  connectedCallback() {
    super.connectedCallback();

    this.$nameForm?.setProps({
      setCars: (carNames: string[]) =>
        this.setState.call(this, { cars: carNames.map((carName) => new Car(carName)) }),
      processNextPhase: () => {
        this.$nameForm?.setProps({ disabled: true });
        this.$tryAmountForm!.hidden = false;
      },
    });

    this.$tryAmountForm?.setProps({
      setTryAmount: (tryAmount: number) => this.setState.call(this, { tryAmount }),
      processNextPhase: () => {
        this.$tryAmountForm?.setProps({ disabled: true });
        this.$gameProgress!.hidden = false;
        this.state.cars.forEach((car) => car.playGame(this.state.tryAmount));
        this.$gameProgress?.setProps({ cars: this.state.cars });
      },
    });

    this.$gameProgress?.setProps({
      processNextPhase: () => {
        this.$gameResult?.setProps({ winners: getWinners(this.state.cars) });
        this.$gameResult!.hidden = false;
      },
    });

    this.$gameResult?.setProps({
      reset: this.reset.bind(this),
    });

    this.hideAll();
  }

  deriveChildren() {
    this.$nameForm = $('my-name-form', this) as Component;
    this.$tryAmountForm = $('my-try-amount-form', this) as Component;
    this.$gameProgress = $('my-game-progress', this) as Component;
    this.$gameResult = $('my-game-result', this) as Component;
  }

  hideAll() {
    this.$tryAmountForm!.hidden = true;
    this.$gameProgress!.hidden = true;
    this.$gameResult!.hidden = true;
  }

  reset() {
    this.hideAll();
    this.$nameForm?.setProps({ disabled: false });
    this.$tryAmountForm?.setProps({ disabled: false });
  }
}

customElements.define('my-app', App);
