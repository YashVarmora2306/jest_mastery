import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <div className="container" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 2rem'
    }}>
      <div style={{ 
        width: 80, 
        height: 80, 
        background: 'var(--accent-primary)', 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(198, 61, 20, 0.4)'
      }}>
        <Terminal size={40} color="white" />
      </div>
      
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800 }}>
        Master Jest Testing
      </h1>
      
      <p style={{ 
        fontSize: '1.2rem', 
        color: 'var(--text-secondary)', 
        maxWidth: '600px', 
        marginBottom: '3rem',
        lineHeight: 1.6
      }}>
        A comprehensive, interactive guide to prepare you for testing in Next.js.
        Write code, run tests, and learn fundamentals in a live environment.
      </p>
      
      <Link href="/step/1" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>
        Start Learning Path <ArrowRight size={20} />
      </Link>
    </div>
  );
}
