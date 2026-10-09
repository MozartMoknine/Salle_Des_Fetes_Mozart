function ColorRow({ label, value, onChange }) {
  return React.createElement('div', null,
    React.createElement('label', { className: 'text-xs text-gray-500 mb-1 block' }, label),
    React.createElement('div', { className: 'flex items-center gap-2' },
      React.createElement('input', {
        type: 'color',
        value: value,
        onChange: (e) => onChange(e.target.value),
        className: 'w-10 h-10 rounded-lg border border-gray-300 cursor-pointer flex-shrink-0'
      }),
      React.createElement('input', {
        type: 'text',
        value: value,
        onChange: (e) => onChange(e.target.value),
        className: 'flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400'
      })
    )
  );
}

function SettingsPanel({ settings, updateSetting, updateSettings, resetSettings, isOpen, onClose }) {
  const coverInputRef = useRef(null);
  const backInputRef = useRef(null);

  const handleImageUpload = (e, key) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSetting(key, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentYear = new Date().getFullYear();

  return React.createElement(React.Fragment, null,
    React.createElement('div', {
      className: `fixed inset-0 bg-black/50 z-40 transition-opacity no-print ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`,
      onClick: onClose
    }),
    React.createElement('div', {
      className: `fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 no-print ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
    },
      React.createElement('div', { className: 'sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement(Icons.Settings, { size: 20, className: 'text-gray-700' }),
          React.createElement('h2', { className: 'text-lg font-semibold text-gray-800' }, 'Paramètres')
        ),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
        },
          React.createElement(Icons.X, { size: 20, className: 'text-gray-500' })
        )
      ),
      React.createElement('div', { className: 'p-6 space-y-8' },

        React.createElement('section', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement(Icons.Calendar, { size: 16, className: 'text-gray-600' }),
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide' }, 'Année')
          ),
          React.createElement('div', { className: 'flex items-center gap-3' },
            React.createElement('button', {
              onClick: () => updateSetting('year', settings.year - 1),
              className: 'w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 text-lg font-bold'
            }, '−'),
            React.createElement('input', {
              type: 'number',
              value: settings.year,
              onChange: (e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1900 && val <= 2200) {
                  updateSetting('year', val);
                }
              },
              className: 'flex-1 text-center text-2xl font-bold border border-gray-300 rounded-lg py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400'
            }),
            React.createElement('button', {
              onClick: () => updateSetting('year', settings.year + 1),
              className: 'w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 text-lg font-bold'
            }, '+')
          ),
          React.createElement('div', { className: 'flex gap-2 mt-2' },
            React.createElement('button', {
              onClick: () => updateSetting('year', currentYear),
              className: 'text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors'
            }, currentYear),
            React.createElement('button', {
              onClick: () => updateSetting('year', currentYear + 1),
              className: 'text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors'
            }, currentYear + 1)
          )
        ),

        React.createElement('section', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement(Icons.Type, { size: 16, className: 'text-gray-600' }),
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide' }, 'Textes')
          ),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', null,
              React.createElement('label', { className: 'text-xs text-gray-500 mb-1 block' }, 'Titre principal'),
              React.createElement('input', {
                type: 'text',
                value: settings.coverTitle,
                onChange: (e) => updateSetting('coverTitle', e.target.value),
                className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'text-xs text-gray-500 mb-1 block' }, 'Sous-titre'),
              React.createElement('input', {
                type: 'text',
                value: settings.coverSubtitle,
                onChange: (e) => updateSetting('coverSubtitle', e.target.value),
                className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'text-xs text-gray-500 mb-1 block' }, 'Titre en arabe'),
              React.createElement('input', {
                type: 'text',
                value: settings.coverYearArabic,
                onChange: (e) => updateSetting('coverYearArabic', e.target.value),
                className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400',
                style: { direction: 'rtl', fontFamily: 'Cairo, sans-serif' }
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'text-xs text-gray-500 mb-1 block' }, 'Nom du propriétaire'),
              React.createElement('input', {
                type: 'text',
                value: settings.ownerName,
                onChange: (e) => updateSetting('ownerName', e.target.value),
                placeholder: 'Votre nom',
                className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'text-xs text-gray-500 mb-1 block' }, 'Coordonnées (téléphone, email, adresse)'),
              React.createElement('textarea', {
                value: settings.ownerInfo,
                onChange: (e) => updateSetting('ownerInfo', e.target.value),
                placeholder: 'Tél: \nEmail: \nAdresse:',
                rows: 4,
                className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none'
              })
            )
          )
        ),

        React.createElement('section', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement(Icons.ImageIcon, { size: 16, className: 'text-gray-600' }),
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide' }, 'Image de couverture')
          ),
          React.createElement('div', { className: 'flex gap-2 mb-3' },
            React.createElement('button', {
              onClick: () => coverInputRef.current && coverInputRef.current.click(),
              className: 'flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors'
            },
              React.createElement(Icons.Upload, { size: 14 }),
              'Téléverser'
            ),
            React.createElement('input', {
              ref: coverInputRef,
              type: 'file',
              accept: 'image/*',
              className: 'hidden',
              onChange: (e) => handleImageUpload(e, 'coverImage')
            })
          ),
          React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
            COVER_IMAGES.map((img) =>
              React.createElement('button', {
                key: img,
                onClick: () => updateSetting('coverImage', img),
                className: `aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${settings.coverImage === img ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'}`
              },
                React.createElement('img', { src: img, alt: 'Cover option', className: 'w-full h-full object-cover' })
              )
            )
          )
        ),

        React.createElement('section', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement(Icons.ImageIcon, { size: 16, className: 'text-gray-600' }),
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide' }, 'Image de dos')
          ),
          React.createElement('div', { className: 'flex gap-2 mb-3' },
            React.createElement('button', {
              onClick: () => backInputRef.current && backInputRef.current.click(),
              className: 'flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors'
            },
              React.createElement(Icons.Upload, { size: 14 }),
              'Téléverser'
            ),
            React.createElement('input', {
              ref: backInputRef,
              type: 'file',
              accept: 'image/*',
              className: 'hidden',
              onChange: (e) => handleImageUpload(e, 'backImage')
            })
          ),
          React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
            BACK_IMAGES.map((img) =>
              React.createElement('button', {
                key: img,
                onClick: () => updateSetting('backImage', img),
                className: `aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${settings.backImage === img ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'}`
              },
                React.createElement('img', { src: img, alt: 'Back cover option', className: 'w-full h-full object-cover' })
              )
            )
          )
        ),

        React.createElement('section', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement(Icons.Palette, { size: 16, className: 'text-gray-600' }),
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide' }, 'Couleurs principales')
          ),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement(ColorRow, { label: 'Couleur principale', value: settings.primaryColor, onChange: (v) => updateSetting('primaryColor', v) }),
            React.createElement(ColorRow, { label: 'Couleur d\'accent', value: settings.accentColor, onChange: (v) => updateSetting('accentColor', v) }),
            React.createElement('div', { className: 'flex gap-2 flex-wrap' },
              [
                { p: '#1a3a2e', a: '#c9a84c', label: 'Vert & Or' },
                { p: '#1a1a2e', a: '#e94560', label: 'Nuit & Rouge' },
                { p: '#2c1810', a: '#d4a574', label: 'Marron & Sable' },
                { p: '#0f3460', a: '#e1a730', label: 'Bleu & Or' },
                { p: '#4a235a', a: '#e8a0bf', label: 'Prune & Rose' },
              ].map((preset) =>
                React.createElement('button', {
                  key: preset.label,
                  onClick: () => updateSettings({ primaryColor: preset.p, accentColor: preset.a }),
                  className: 'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'
                },
                  React.createElement('div', { className: 'flex' },
                    React.createElement('div', { className: 'w-4 h-4 rounded-full border border-white', style: { backgroundColor: preset.p } }),
                    React.createElement('div', { className: 'w-4 h-4 rounded-full border border-white -ml-1.5', style: { backgroundColor: preset.a } })
                  ),
                  React.createElement('span', { className: 'text-xs text-gray-600' }, preset.label)
                )
              )
            )
          )
        ),

        React.createElement('section', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement(Icons.Palette, { size: 16, className: 'text-gray-600' }),
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide' }, 'Couleurs des jours')
          ),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement(ColorRow, { label: 'Samedi — couleur de fond', value: settings.saturdayBgColor, onChange: (v) => updateSetting('saturdayBgColor', v) }),
            React.createElement(ColorRow, { label: 'Samedi — couleur du texte', value: settings.saturdayFontColor, onChange: (v) => updateSetting('saturdayFontColor', v) }),
            React.createElement(ColorRow, { label: 'Dimanche — couleur de fond', value: settings.sundayBgColor, onChange: (v) => updateSetting('sundayBgColor', v) }),
            React.createElement(ColorRow, { label: 'Dimanche — couleur du texte', value: settings.sundayFontColor, onChange: (v) => updateSetting('sundayFontColor', v) }),
            React.createElement(ColorRow, { label: 'Jours de semaine — couleur du texte', value: settings.weekdayFontColor, onChange: (v) => updateSetting('weekdayFontColor', v) })
          )
        ),

        React.createElement('section', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement(Icons.Palette, { size: 16, className: 'text-gray-600' }),
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide' }, 'Couleurs des cases A.M. / Soir')
          ),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement(ColorRow, { label: 'Case Après-Midi', value: settings.amBoxColor, onChange: (v) => updateSetting('amBoxColor', v) }),
            React.createElement(ColorRow, { label: 'Case Soir', value: settings.soirBoxColor, onChange: (v) => updateSetting('soirBoxColor', v) })
          )
        ),

        React.createElement('section', null,
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement(Icons.Type, { size: 16, className: 'text-gray-600' }),
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide' }, 'Police')
          ),
          React.createElement('select', {
            value: settings.fontStyle,
            onChange: (e) => updateSetting('fontStyle', e.target.value),
            className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'
          },
            FONT_OPTIONS.map((opt) =>
              React.createElement('option', { key: opt.value, value: opt.value, style: { fontFamily: opt.value } }, opt.label)
            )
          )
        ),

        React.createElement('section', null,
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3' }, 'Options'),
          React.createElement('div', { className: 'space-y-3' },
            [
              { key: 'showHijri', label: 'Afficher le calendrier hégirien' },
              { key: 'showWeekNumbers', label: 'Numéros de semaine' },
              { key: 'weekStartsMonday', label: 'Semaine commence lundi' },
            ].map((opt) =>
              React.createElement('label', { key: opt.key, className: 'flex items-center justify-between cursor-pointer' },
                React.createElement('span', { className: 'text-sm text-gray-600' }, opt.label),
                React.createElement('button', {
                  onClick: () => updateSetting(opt.key, !settings[opt.key]),
                  className: `w-11 h-6 rounded-full transition-colors relative ${settings[opt.key] ? 'bg-blue-500' : 'bg-gray-300'}`
                },
                  React.createElement('div', {
                    className: `absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings[opt.key] ? 'translate-x-5' : 'translate-x-0.5'}`
                  })
                )
              )
            )
          )
        ),

        React.createElement('button', {
          onClick: resetSettings,
          className: 'flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors'
        },
          React.createElement(Icons.RotateCcw, { size: 14 }),
          'Réinitialiser les paramètres'
        )
      )
    )
  );
}
