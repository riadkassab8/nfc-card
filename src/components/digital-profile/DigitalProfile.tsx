import React from 'react';
import { CardItem } from '../../types';
import { PublicCardView } from '../public/PublicCardView';

export interface DigitalProfileProps {
  card: CardItem;
}

export const DigitalProfile: React.FC<DigitalProfileProps> = ({ card }) => {
  return <PublicCardView card={card} />;
};
