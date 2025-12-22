import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Platform, TextInput, PanResponder, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef, useMemo } from 'react';

export default function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [focusedButton, setFocusedButton] = useState('left'); // 'left' or 'right'
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const hasIncremented = useRef(false);
  const hasDecremented = useRef(false);
  const hasSwitchedFocus = useRef(false);
  const focusedButtonRef = useRef('left');
  
  useEffect(() => {
    focusedButtonRef.current = focusedButton;
  }, [focusedButton]);

  const scrollToBottom = () => {
    if (Platform.OS === 'android' && inputRef.current) {
      // Add a character to force cursor to move to bottom
      setInputValue(prev => prev + ' ');
      setTimeout(() => {
        inputRef.current?.setNativeProps({
          selection: { start: 999999, end: 999999 }
        });
      }, 0);
    }
  };
  
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
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
        scrollToBottom();
      }
      // Detect upward swipe (dy negative means moving up) - decrement
      else if (gestureState.dy < -20 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy) && !hasDecremented.current) {
        if (focusedButtonRef.current === 'left') {
          setCount1(prevCount => Math.max(0, prevCount - 1));
        } else {
          setCount2(prevCount => Math.max(0, prevCount - 1));
        }
        hasDecremented.current = true;
        scrollToBottom();
      }
      // Detect left swipe (dx negative means moving left) - focus right button
      else if (gestureState.dx < -30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && !hasSwitchedFocus.current) {
        setFocusedButton('right');
        hasSwitchedFocus.current = true;
        scrollToBottom();
      }
      // Detect right swipe (dx positive means moving right) - focus left button
      else if (gestureState.dx > 30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && !hasSwitchedFocus.current) {
        setFocusedButton('left');
        hasSwitchedFocus.current = true;
        scrollToBottom();
      }
    },
    onPanResponderRelease: (event, gestureState) => {
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
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={inputValue}
        onChangeText={setInputValue}
        onKeyPress={handleKeyPress}
        showSoftInputOnFocus={false}
        caretHidden={true}
        contextMenuHidden={true}
        editable={true}
        multiline={true}
        scrollEnabled={false}
        pointerEvents="none"
      />
      <View style={styles.scoreButton} {...panResponder.panHandlers}>
        <TouchableOpacity 
          style={[styles.leftButton, focusedButton === 'left' && styles.focusedButton]}
          onPress={() => { setFocusedButton('left'); }}
          activeOpacity={1}
        >
          <Text style={styles.scoreText}>{count1}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.scoreButton} {...panResponder.panHandlers}>
        <TouchableOpacity 
          style={[styles.rightButton, focusedButton === 'right' && styles.focusedButton]}
          onPress={() => { setFocusedButton('right'); }}
          activeOpacity={1}
        >
          <Text style={styles.scoreText}>{count2}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={() => { setCount1(0); setCount2(0); }}
        activeOpacity={0.7}
      >
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
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
  scoreButton: {
    flex: 1,
  },
  leftButton: {
    flex: 1,
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButton: {
    flex: 1,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedButton: {
    borderWidth: 8,
    borderColor: '#FFFFFF',
  },
  scoreText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 999,
    elevation: 10,
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
