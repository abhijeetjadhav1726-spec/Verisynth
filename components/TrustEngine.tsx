export default function TrustEngine() {
  return (
    <section style={{ padding: '100px 24px' }}>
      <div className="container">
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>The Digital Trust Engine</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            We do not rely on a single black-box AI model. VeriSynth uses a deterministic, multi-layered approach to guarantee reliability.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div className="fade-up stagger-1" style={{ background: 'linear-gradient(135deg, rgba(99,91,255,0.1) 0%, rgba(26,26,36,1) 100%)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-card)', padding: '40px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>Explainable AI via Grad-CAM</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '800px' }}>
              Transparency is critical. When our model flags an image, it generates a Grad-CAM heatmap overlay. This shows exactly which pixels the neural network focused on to make its decision, allowing human analysts to verify the AI's logic.
            </p>
          </div>

          <div className="fade-up stagger-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: '32px' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>Frequency Domain</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              GANs leave distinct artifacts when upsampling. We use Fast Fourier Transforms (FFT) to analyze the image spectrum and detect these invisible periodic frequencies.
            </p>
          </div>

          <div className="fade-up stagger-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: '32px' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>Texture Analysis</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Face-swapping tools leave blending seams. We use Laplacian variance and median filtering to find mismatches in the noise floor between the face and the background.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
