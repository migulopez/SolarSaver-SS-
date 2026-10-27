/**
 * TechnicalModal.js
 * Technical blueprint and STL 3D reference inspection dialog.
 */
export class TechnicalModal {
  constructor() {
    this.el = document.getElementById('technical-modal');
    this.init();
  }

  init() {
    if (!this.el) return;

    this.el.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-window">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="modal-badge">DOCUMENTACIÓN DE INGENIERÍA</span>
            <h2>Especificaciones Técnicas & Planos de Referencia: SolarSaver-SS</h2>
          </div>
          <button class="modal-close-btn" id="modal-close">&times;</button>
        </div>

        <div class="modal-tabs">
          <button class="modal-tab-btn active" data-tab="blueprint">📐 Plano Técnico Oficial</button>
          <button class="modal-tab-btn" data-tab="stl">🧊 Render 3D STL Prototipo</button>
          <button class="modal-tab-btn" data-tab="specs">📊 Ficha Técnica Completa</button>
          <button class="modal-tab-btn" data-tab="pedagogy">🎓 Principios de Funcionamiento</button>
        </div>

        <div class="modal-body">
          <!-- Tab 1: Blueprint -->
          <div class="tab-content active" id="tab-blueprint">
            <div class="blueprint-viewer">
              <img src="./assets/plano_tecnico_solarsaver.png" alt="Plano técnico SolarSaver-SS" class="blueprint-img" />
              <div class="blueprint-legend">
                <div class="legend-chip"><strong>Vista Frontal:</strong> 40 cm × 20 cm | Pantallas LCD duales, tomas 120V, 4 USB, bandeja inferior</div>
                <div class="legend-chip"><strong>Vista Lateral:</strong> 30 cm × 20 cm | Logotipo Sol + Cruz de rescate, conector prensaestopa panel</div>
                <div class="legend-chip"><strong>Vista Superior:</strong> 40 cm × 30 cm | Manija central ergonómica y esquinas reforzadas</div>
                <div class="legend-chip"><strong>Panel Solar Externo:</strong> 30 cm × 20 cm | Fotovoltaico monocristalino orientable con soporte</div>
              </div>
            </div>
          </div>

          <!-- Tab 2: STL Render -->
          <div class="tab-content" id="tab-stl">
            <div class="blueprint-viewer">
              <img src="./assets/render_stl_solarsaver.png" alt="Render 3D STL SolarSaver-SS" class="blueprint-img" />
              <div class="blueprint-legend">
                <div class="legend-chip"><strong>Bandeja Deslizante:</strong> Sistema de corredera frontal con bahía doble para smartphones.</div>
                <div class="legend-chip"><strong>Carcasa Reforzada:</strong> Polímero ABS de alto impacto con bumpers esquineros para rescate y exteriores.</div>
              </div>
            </div>
          </div>

          <!-- Tab 3: Detailed Specs -->
          <div class="tab-content" id="tab-specs">
            <table class="specs-table">
              <thead>
                <tr>
                  <th>Componente</th>
                  <th>Especificación Oficial</th>
                  <th>Detalle Funcional</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dimensiones Generales</strong></td>
                  <td>40 cm (Ancho) × 20 cm (Alto) × 30 cm (Profundidad)</td>
                  <td>Carcasa rectangular resistente con bumpers en las 8 esquinas.</td>
                </tr>
                <tr>
                  <td><strong>Panel Solar Externo</strong></td>
                  <td>30 cm (Alto) × 20 cm (Ancho)</td>
                  <td>Monocristalino 40Wp con soporte basculante e inclinación graduable. Conexión por cable de goma flexible.</td>
                </tr>
                <tr>
                  <td><strong>Pantallas Frontales</strong></td>
                  <td>2 Displays LCD retroiluminados azules</td>
                  <td>Display Izquierdo: Voltaje 12.6V, irradiancia y estado de carga MPPT.<br>Display Derecho: Potencia de salida, corriente y cargas activas.</td>
                </tr>
                <tr>
                  <td><strong>Tomas de CA</strong></td>
                  <td>2x Salidas 120V CA (NEMA 5-15R)</td>
                  <td>Inversor integrado de onda sinusoidal modificada con señalética de advertencia de alta tensión.</td>
                </tr>
                <tr>
                  <td><strong>Puertos USB</strong></td>
                  <td>4x USB-A 5V / 2.4A</td>
                  <td>Regulador step-down DC/DC de alta eficiencia con protección contra cortocircuito.</td>
                </tr>
                <tr>
                  <td><strong>Bandeja de Celulares</strong></td>
                  <td>Bandeja extraíble frontal inferior</td>
                  <td>Alojamiento seguro con guías deslizantes para 2 teléfonos inteligentes con carga simultánea.</td>
                </tr>
                <tr>
                  <td><strong>Emblema Lateral</strong></td>
                  <td>Sol con cruz de emergencia</td>
                  <td>Identificación visual para situaciones de socorro y brigadas de rescate.</td>
                </tr>
                <tr>
                  <td><strong>Banco de Baterías</strong></td>
                  <td>Li-ion 3S (11.1V - 12.6V) / 150 Wh</td>
                  <td>BMS integrado con corte por sobretensión, sobredescarga y control térmico por ventilación asistida.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tab 4: Pedagogy -->
          <div class="tab-content" id="tab-pedagogy">
            <div class="pedagogy-content">
              <h3>⚡ Simulación Educativa del Flujo Energético</h3>
              <p>Esta aplicación interactiva implementa una simulación física y didáctica que ilustra los principios clave de la energía solar fotovoltaica:</p>
              
              <div class="pedagogy-cards">
                <div class="p-card">
                  <h4>1. Ley del Coseno de Lambert (Orientación Solar)</h4>
                  <p>La potencia generada por el panel solar externo depende del ángulo entre el vector normal del panel ($\vec{N}$) y el vector hacia el Sol ($\vec{S}$):</p>
                  <code>P = P_max × cos(θ) × (1 - Nubosidad)</code>
                  <p>Al alinear el panel directamente hacia el Sol, la inclinación óptima reduce el ángulo de incidencia a 0°, maximizando los Watts producidos.</p>
                </div>

                <div class="p-card">
                  <h4>2. Curva de Descarga de Baterías de Litio 3S</h4>
                  <p>El banco de baterías de tres celdas de iones de litio en serie opera en un rango seguro de 10.8V (agotada) a 12.6V (4.2V por celda, carga al 100%). Las pantallas LCD reflejan este voltaje dinámico en función del estado de carga (SoC).</p>
                </div>

                <div class="p-card">
                  <h4>3. Balance de Potencia y Autonomía</h4>
                  <p>Cuando el flujo neto es positivo (Entrada Solar > Consumo), la batería almacena energía. Si se conectan los celulares y las tomas de 120V y el Sol no basta, la estación entrega corriente desde la batería, calculando la autonomía en horas y minutos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <span>SolarSaver-SS © 2026 — Proyecto de Estación Solar para Emergencias</span>
          <button class="btn btn-secondary" id="modal-close-footer">Cerrar</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = document.getElementById('modal-close');
    const closeFooter = document.getElementById('modal-close-footer');
    const backdrop = this.el.querySelector('.modal-backdrop');

    const closeModal = () => this.el.classList.remove('modal-open');

    closeBtn?.addEventListener('click', closeModal);
    closeFooter?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    // Tab buttons
    const tabBtns = this.el.querySelectorAll('.modal-tab-btn');
    const tabContents = this.el.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const activeContent = document.getElementById(`tab-${tabId}`);
        if (activeContent) activeContent.classList.add('active');
      });
    });
  }
}
