import { Card, CardActionArea, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const imageUrl = product.product_images?.[0]?.image_url ?? `https://picsum.photos/seed/${product.id}/400/300`;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => navigate(`/products/${product.id}`)} sx={{ flex: 1 }}>
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={700}>
            ₹{product.price.toLocaleString('en-IN')}
          </Typography>
          {product.quantity === 0 && (
            <Chip label="Out of Stock" color="error" size="small" sx={{ mt: 1 }} />
          )}
          {product.quantity > 0 && product.quantity <= 5 && (
            <Chip label={`Only ${product.quantity} left`} color="warning" size="small" sx={{ mt: 1 }} />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
