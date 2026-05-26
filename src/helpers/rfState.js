const BUTTONS = {
  A: 0x01, // 1  (00000001)
  B: 0x02, // 2  (00000010)
  C: 0x04, // 4  (00000100)
  D: 0x08, // 8  (00001000)
};

export default function (receivedByte) {
  const pressed = [];

  // 2. Проверяем каждый бит с помощью оператора &
  if (receivedByte & BUTTONS.A) pressed.push("A");
  if (receivedByte & BUTTONS.B) pressed.push("B");
  if (receivedByte & BUTTONS.C) pressed.push("C");
  if (receivedByte & BUTTONS.D) pressed.push("D");

  return pressed;
}
