let currentToken = 1;

const generateOrderToken = () => {
  return currentToken++;
};

export default generateOrderToken;