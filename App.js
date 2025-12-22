import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Platform, TextInput, PanResponder } from 'react-native';
import { useState, useEffect, useRef, useMemo } from 'react';

export default function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [focusedButton, setFocusedButton] = useState('left'); // 'left' or 'right'
  const inputRef = useRef(null);
  const hasIncremented = useRef(false);
  const hasDecremented = useRef(false);
  const hasSwitchedFocus = useRef(false);
  const focusedButtonRef = useRef('left');
  
  useEffect(() => {
    focusedButtonRef.current = focusedButton;
  }, [focusedButton]);
  
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderMove: (event, gestureState) => {
      // Detect downward swipe (dy positive means moving down) - increment
      if (gestureState.dy > 20 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy) && !hasIncremented.current) {
        if (focusedButtonRef.current === 'left') {
          setCount1(prevCount => prevCount + 1);
        } else {
          setCount2(prevCount => prevCount + 1);
        }
        hasIncremented.current = true;
      }
      // Detect upward swipe (dy negative means moving up) - decrement
      else if (gestureState.dy < -20 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy) && !hasDecremented.current) {
        if (focusedButtonRef.current === 'left') {
          setCount1(prevCount => Math.max(0, prevCount - 1));
        } else {
          setCount2(prevCount => Math.max(0, prevCount - 1));
        }
        hasDecremented.current = true;
      }
      // Detect left swipe (dx negative means moving left) - focus right button
      else if (gestureState.dx < -30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && !hasSwitchedFocus.current) {
        setFocusedButton('right');
        hasSwitchedFocus.current = true;
      }
      // Detect right swipe (dx positive means moving right) - focus left button
      else if (gestureState.dx > 30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && !hasSwitchedFocus.current) {
        setFocusedButton('left');
        hasSwitchedFocus.current = true;
      }
    },
    onPanResponderRelease: () => {
      hasIncremented.current = false;
      hasDecremented.current = false;
      hasSwitchedFocus.current = false;
    },
    onPanResponderTerminate: () => {
      hasIncremented.current = false;
      hasDecremented.current = false;
      hasSwitchedFocus.current = false;
    },
  }), []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyPress = (event) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          if (focusedButton === 'left') {
            setCount1(prevCount => prevCount + 1);
          } else {
            setCount2(prevCount => prevCount + 1);
          }
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          if (focusedButton === 'left') {
            setCount1(prevCount => Math.max(0, prevCount - 1));
          } else {
            setCount2(prevCount => Math.max(0, prevCount - 1));
          }
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          setFocusedButton('left');
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          setFocusedButton('right');
        }
      };

      window.addEventListener('keydown', handleKeyPress);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, []);

  const handleKeyPress = (e) => {
    console.log('Key pressed:', e.nativeEvent.key);
    if (e.nativeEvent.key === 'ArrowUp') {
      if (focusedButton === 'left') {
        setCount1(prevCount => prevCount + 1);
      } else {
        setCount2(prevCount => prevCount + 1);
      }
    } else if (e.nativeEvent.key === 'ArrowDown') {
      if (focusedButton === 'left') {
        setCount1(prevCount => Math.max(0, prevCount - 1));
      } else {
        setCount2(prevCount => Math.max(0, prevCount - 1));
      }
    } else if (e.nativeEvent.key === 'ArrowLeft') {
      setFocusedButton('left');
    } else if (e.nativeEvent.key === 'ArrowRight') {
      setFocusedButton('right');
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        onKeyPress={handleKeyPress}
        showSoftInputOnFocus={false}
        caretHidden={true}
        contextMenuHidden={true}
        editable={true}
        multiline={false}
        scrollEnabled={false}
        pointerEvents="none"
      />
      <View style={styles.buttonsRow}>
        <View style={[styles.scoreButton, focusedButton === 'left' && styles.focusedButton]}>
          <Button title={String(count1)} onPress={() => { setFocusedButton('left'); setCount1(count1 + 1); }} />
        </View>
        <View style={[styles.scoreButton, focusedButton === 'right' && styles.focusedButton]}>
          <Button title={String(count2)} onPress={() => { setFocusedButton('right'); setCount2(count2 + 1); }} />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Reset" onPress={() => { setCount1(0); setCount2(0); }} />
      </View>
      <Text style={styles.instructionText}>Swipe ← → to select, ↓ to +1, ↑ to -1</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0.01,
    color: 'transparent',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  scoreButton: {
    width: 100,
  },
  focusedButton: {
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 5,
    padding: 2,
  },
  buttonContainer: {
    marginVertical: 10,
    width: 200,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
});
