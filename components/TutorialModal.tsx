import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "../contexts/LanguageContext"

interface TutorialModalProps {
  onClose: () => void
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const { t } = useLanguage()

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("welcomeTitle")}</DialogTitle>
          <DialogDescription>{t("welcomeDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p>{t("welcomeStep1")}</p>
          <p>{t("welcomeStep2")}</p>
          <p>{t("welcomeStep3")}</p>
          <p>{t("welcomeStep4")}</p>
          <p>{t("welcomeStep5")}</p>
          <p>{t("welcomeStep6")}</p>
        </div>
        <Button onClick={onClose} className="mt-4">
          {t("gotIt")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default TutorialModal

