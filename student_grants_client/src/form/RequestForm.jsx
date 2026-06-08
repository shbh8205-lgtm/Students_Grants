import { FamilyForm } from './FamilyForm';
import { BankForm } from './BankForm';
import { StudiesForm } from './StudiesForm';
import { PersonalForm } from './PersonalForm';
import { VerifyForm } from './VerifyForm';
import { MainForm } from './MainForm';

export const RequestForm = () => {
    return (
        <MainForm>
            <PersonalForm />
            <FamilyForm />
            <BankForm />
            <StudiesForm />
            <VerifyForm />
        </MainForm>
    );
};
