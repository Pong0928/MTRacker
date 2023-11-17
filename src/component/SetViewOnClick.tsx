import { useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

interface SetViewOnClickProps {
  coords: LatLngExpression;
}

const SetViewOnClick: React.FC<SetViewOnClickProps> = ({ coords }) => {
  const map = useMap();

  // Set the view of the map to the specified coordinates when the component is rendered
  map.setView(coords, 12);

  // The component doesn't render anything (returns null)
  return null;
};

export default SetViewOnClick;