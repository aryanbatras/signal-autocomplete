import { Button } from './src/components/Button';

function App() {
  return (
    <div>
      <Button primary hoverEnlarge>
        Click me
      </Button>
      
      <Button secondary lg>
        Another button
      </Button>
      
      <Button 
        primary 
        lg 
        hoverEnlarge
        pressShrink
      >
        Big button
      </Button>
    </div>
  );
}
