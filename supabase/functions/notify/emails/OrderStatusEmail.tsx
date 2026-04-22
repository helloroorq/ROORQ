import React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Preview,
  Section,
} from '@react-email/components';

const main = {  
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  border: '2px solid #000',
  padding: '20px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.1',
  fontWeight: '900',
  textTransform: 'uppercase' as const,
  letterSpacing: '-1px',
  margin: '20px 0',
};

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333',
  margin: '16px 0',
};

interface OrderStatusProps {
  orderNumber: string;
  status: string;
  message?: string;
}

const statusLabelMap: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Packed',
  out_for_delivery: 'Dispatched',
  delivered: 'Delivered',
  payment_collected: 'Payment Collected',
  cancelled: 'Cancelled',
};

export const OrderStatusEmail = ({ orderNumber, status, message }: OrderStatusProps) => {
  const label = statusLabelMap[status] ?? status.replace(/_/g, ' ');

  return (
  <Html>
    <Head />
    <Preview>Update on Order {orderNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>
          Order {label}
        </Heading>
        
        <Text style={text}>
          Your order <strong>{orderNumber}</strong> has been updated.
        </Text>

        <Section style={{ backgroundColor: '#f5f5f5', padding: '20px', borderLeft: '4px solid #000' }}>
          <Text style={{ ...text, margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
            Current Status: {label}
          </Text>
        </Section>

        {message && (
          <Text style={text}>{message}</Text>
        )}
        
        {status === 'out_for_delivery' && (
           <Text style={text}>
             Our rider will call you shortly. Please be ready with Cash or UPI.
           </Text>
        )}

      </Container>
    </Body>
  </Html>
  );
};

export default OrderStatusEmail;
