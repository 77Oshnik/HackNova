import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const RouteForm = ({ onSubmit, isLoading }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (source && destination) {
      onSubmit(source, destination);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* <div>
        <Input
          type="text"
          placeholder="Starting point"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="route-input"
        />
      </div>
      <div>
        <Input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="route-input"
        />
      </div> */}
      <Button
        type="submit"
        disabled={!source || !destination || isLoading}
        className="route-button"
      >
        {isLoading ? (
          'Calculating routes...'
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Find Routes
          </>
        )}
      </Button>
    </form>
  );
};

export default RouteForm;
